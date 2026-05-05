import { Request, Response, NextFunction } from "express";
import { query, getClient } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

const EDIT_WINDOW_HOURS = 48;

/**
 * Check if an attendance record can be edited (within 48 hours of creation).
 * If the record was created more than 48 hours ago, it's locked.
 */
async function getRecordEditability(
  client: any,
  studentId: string,
  subjectId: string,
  date: string
): Promise<{ editable: boolean; record: any; reason?: string }> {
  const result = await client.query(
    `SELECT a.*,
            EXTRACT(EPOCH FROM (NOW() - a.created_at)) / 3600 as hours_since_creation,
            a.date < (CURRENT_DATE - INTERVAL '2 days') as is_old_date
     FROM attendance a
     WHERE a.student_id = $1 AND a.subject_id = $2 AND a.date = $3`,
    [studentId, subjectId, date]
  );

  const record = result.rows[0];

  if (!record) {
    // New record — always editable
    return { editable: true, record: null };
  }

  const hoursSinceCreation = parseFloat(record.hours_since_creation || "0");

  // Check 1: Date is more than 2 days ago (hard cutoff based on the attendance date itself)
  if (record.is_old_date) {
    return {
      editable: false,
      record,
      reason: `Attendance for ${date} is from more than 2 days ago and cannot be modified.`,
    };
  }

  // Check 2: Created more than 48 hours ago
  if (hoursSinceCreation > EDIT_WINDOW_HOURS) {
    const hoursRounded = Math.round(hoursSinceCreation);
    return {
      editable: false,
      record,
      reason: `This record was created ${hoursRounded} hours ago. Records can only be edited within ${EDIT_WINDOW_HOURS} hours of creation.`,
    };
  }

  return { editable: true, record };
}

/**
 * Mark or update attendance for multiple students in a subject on a given date.
 * Supports both new marking and editing within the 48-hour window.
 */
export async function markAttendance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    const { subject_id, date, records, remarks } = req.body;

    // Resolve the marker (faculty or admin)
    let facultyId: string | null = null;
    const userRole = req.user!.role;

    if (userRole === "faculty") {
      const facRes = await client.query(
        "SELECT id, user_id FROM faculty WHERE user_id = $1 AND is_active = true",
        [req.user!.userId]
      );
      if (!facRes.rows[0]) {
        throw new AppError("Faculty profile not found. Contact admin to set up your faculty profile.", 403);
      }
      facultyId = facRes.rows[0].id;
    } else if (userRole === "admin") {
      // Admin can mark attendance — try to find a faculty record, otherwise use null
      const facRes = await client.query(
        "SELECT id FROM faculty WHERE user_id = $1",
        [req.user!.userId]
      );
      facultyId = facRes.rows[0]?.id || null;
    }

    // Verify subject
    const subRes = await client.query(
      "SELECT id, name FROM subjects WHERE id = $1 AND is_active = true",
      [subject_id]
    );
    if (!subRes.rows[0]) {
      throw new AppError("Subject not found or inactive.", 404);
    }

    const attDate = date || new Date().toISOString().split("T")[0];
    let markedCount = 0;
    let updatedCount = 0;
    let lockedCount = 0;
    const lockedDetails: string[] = [];

    for (const record of records) {
      const { student_id, status } = record;

      // Verify student exists and is active
      const stuRes = await client.query(
        "SELECT id, roll_no, user_id FROM students WHERE id = $1 AND is_active = true",
        [student_id]
      );
      if (!stuRes.rows[0]) continue;

      // Check editability
      const { editable, reason } = await getRecordEditability(
        client,
        student_id,
        subject_id,
        attDate
      );

      if (!editable) {
        lockedCount++;
        lockedDetails.push(`${stuRes.rows[0].roll_no}: ${reason}`);
        continue;
      }

      // Check if this is an upsert (update existing or insert new)
      const existing = await client.query(
        "SELECT id FROM attendance WHERE student_id = $1 AND subject_id = $2 AND date = $3",
        [student_id, subject_id, attDate]
      );

      if (existing.rows.length > 0) {
        // Update existing record
        await client.query(
          `UPDATE attendance
           SET status = $1, marked_by = $2, remarks = $3, updated_at = NOW()
           WHERE id = $4`,
          [status, facultyId, remarks, existing.rows[0].id]
        );
        updatedCount++;
      } else {
        // Insert new record
        await client.query(
          `INSERT INTO attendance (student_id, subject_id, date, status, marked_by, remarks)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [student_id, subject_id, attDate, status, facultyId, remarks]
        );
        markedCount++;
      }
    }

    await client.query("COMMIT");

    const response: any = {
      success: true,
      message: `Attendance saved for ${subRes.rows[0].name} on ${attDate}.`,
      summary: {
        new_records: markedCount,
        updated_records: updatedCount,
        locked_records: lockedCount,
      },
    };

    if (lockedCount > 0) {
      response.warning = `${lockedCount} record(s) could not be modified because they are outside the ${EDIT_WINDOW_HOURS}-hour edit window.`;
      response.locked_details = lockedDetails;
    }

    res.status(201).json(response);
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

/**
 * Get attendance records for a specific subject and date — with editability flags.
 * Used by the bulk marking UI to show current state and lock status.
 */
export async function getAttendanceForMarking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { subject_id, date } = req.query;

    if (!subject_id || !date) {
      throw new AppError("subject_id and date are required.", 400);
    }

    const subjectDate = date as string;

    // Verify subject
    const subRes = await query(
      "SELECT id, name, code, course_id FROM subjects WHERE id = $1 AND is_active = true",
      [subject_id]
    );
    if (!subRes.rows[0]) {
      throw new AppError("Subject not found.", 404);
    }

    const subject = subRes.rows[0];

    // Get all active students in this course
    const students = await query(
      `SELECT s.id, s.roll_no, s.semester, u.name, u.email
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.course_id = $1 AND s.is_active = true AND u.is_active = true
       ORDER BY s.roll_no`,
      [subject.course_id]
    );

    // Get existing attendance for this subject + date
    const existingAtt = await query(
      `SELECT a.*,
              EXTRACT(EPOCH FROM (NOW() - a.created_at)) / 3600 as hours_since_creation
       FROM attendance a
       WHERE a.subject_id = $1 AND a.date = $2`,
      [subject_id, subjectDate]
    );

    const attMap = new Map<string, any>();
    for (const row of existingAtt.rows) {
      attMap.set(row.student_id, row);
    }

    // Check lock status for the date
    const isDateOld = new Date(subjectDate) < new Date(Date.now() - EDIT_WINDOW_HOURS * 60 * 60 * 1000);
    // Also check if the date itself is in the past by more than 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const isPastCutoff = new Date(subjectDate) < new Date(twoDaysAgo.toISOString().split("T")[0]);

    const records = students.rows.map((student: any) => {
      const existing = attMap.get(student.id);
      const hoursSince = existing ? parseFloat(existing.hours_since_creation || "0") : 0;

      // Determine if this record is locked
      let locked = false;
      let lockReason = "";

      if (existing) {
        if (isPastCutoff || hoursSince > EDIT_WINDOW_HOURS) {
          locked = true;
          lockReason = `Record locked — beyond ${EDIT_WINDOW_HOURS}-hour edit window (${Math.round(hoursSince)} hours since creation).`;
        }
      }

      return {
        student_id: student.id,
        roll_no: student.roll_no,
        name: student.name,
        semester: student.semester,
        status: existing?.status || "present",
        remarks: existing?.remarks || "",
        locked,
        lock_reason: lockReason,
        is_existing: !!existing,
        created_at: existing?.created_at || null,
        updated_at: existing?.updated_at || null,
      };
    });

    res.json({
      success: true,
      data: {
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.code,
        },
        date: subjectDate,
        is_locked: isPastCutoff,
        lock_reason: isPastCutoff
          ? `Attendance for ${subjectDate} is from more than 2 days ago and is locked for all students.`
          : null,
        records,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get attendance records with filters.
 */
export async function getAttendance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (req.query.student_id) {
      conditions.push(`a.student_id = $${idx++}`);
      values.push(req.query.student_id);
    }
    if (req.query.subject_id) {
      conditions.push(`a.subject_id = $${idx++}`);
      values.push(req.query.subject_id);
    }
    if (req.query.status) {
      conditions.push(`a.status = $${idx++}`);
      values.push(req.query.status);
    }
    if (req.query.date_from) {
      conditions.push(`a.date >= $${idx++}`);
      values.push(req.query.date_from);
    }
    if (req.query.date_to) {
      conditions.push(`a.date <= $${idx++}`);
      values.push(req.query.date_to);
    }
    if (req.query.course_id) {
      conditions.push(`s.course_id = $${idx++}`);
      values.push(req.query.course_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Also compute if each record is editable
    const countResult = await query(
      `SELECT COUNT(*) FROM attendance a
       JOIN students s ON s.id = a.student_id
       ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT a.*,
              EXTRACT(EPOCH FROM (NOW() - a.created_at)) / 3600 as hours_since_creation,
              u.name as student_name, u.email as student_email, s.roll_no, s.semester,
              c.name as course_name,
              sub.name as subject_name, sub.code as subject_code,
              fac_u.name as marked_by_name
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = s.course_id
       JOIN subjects sub ON sub.id = a.subject_id
       LEFT JOIN faculty f ON f.id = a.marked_by
       LEFT JOIN users fac_u ON fac_u.id = f.user_id
       ${where}
       ORDER BY a.date DESC, a.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    // Add editable flag to each record
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const enrichedData = result.rows.map((row: any) => {
      const hoursSince = parseFloat(row.hours_since_creation || "0");
      const isDateOld = new Date(row.date) < twoDaysAgo;
      const editable = !isDateOld && hoursSince <= EDIT_WINDOW_HOURS;

      return {
        ...row,
        editable,
        lock_reason: !editable
          ? isDateOld
            ? `Attendance date (${row.date}) is beyond the 2-day edit window.`
            : `Record was created ${Math.round(hoursSince)} hours ago. Edit window is ${EDIT_WINDOW_HOURS} hours.`
          : null,
      };
    });

    res.json({
      success: true,
      data: enrichedData,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a student's own attendance records.
 */
export async function getMyAttendance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const stuRes = await query("SELECT id FROM students WHERE user_id = $1", [userId]);
    if (!stuRes.rows[0]) {
      throw new AppError("Student profile not found.", 404);
    }
    const studentId = stuRes.rows[0].id;

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ["a.student_id = $1"];
    const values: any[] = [studentId];
    let idx = 2;

    if (req.query.subject_id) {
      conditions.push(`a.subject_id = $${idx++}`);
      values.push(req.query.subject_id);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const countResult = await query(`SELECT COUNT(*) FROM attendance a ${where}`, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT a.*, sub.name as subject_name, sub.code as subject_code
       FROM attendance a
       JOIN subjects sub ON sub.id = a.subject_id
       ${where}
       ORDER BY a.date DESC, sub.name
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get attendance summary/stats for a student.
 */
export async function getAttendanceSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const stuRes = await query(
      "SELECT id, course_id, semester FROM students WHERE user_id = $1",
      [userId]
    );
    if (!stuRes.rows[0]) {
      throw new AppError("Student profile not found.", 404);
    }

    const { id: studentId, course_id, semester } = stuRes.rows[0];

    // Get subjects for this course up to current semester
    const subjects = await query(
      `SELECT id, name, code FROM subjects
       WHERE course_id = $1 AND semester <= $2 AND is_active = true
       ORDER BY semester, name`,
      [course_id, semester]
    );

    // Attendance stats per subject
    const stats = [];
    for (const sub of subjects.rows) {
      const result = await query(
        `SELECT
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE status = 'present') as present,
           COUNT(*) FILTER (WHERE status = 'absent') as absent,
           COUNT(*) FILTER (WHERE status = 'late') as late,
           COUNT(*) FILTER (WHERE status = 'leave') as leave_count,
           COUNT(*) FILTER (WHERE status = 'holiday') as holiday
         FROM attendance
         WHERE student_id = $1 AND subject_id = $2`,
        [studentId, sub.id]
      );
      stats.push({ ...sub, ...result.rows[0] });
    }

    // Overall stats
    const overall = await query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE status = 'present') as present,
         COUNT(*) FILTER (WHERE status = 'absent') as absent,
         COUNT(*) FILTER (WHERE status = 'late') as late
       FROM attendance WHERE student_id = $1`,
      [studentId]
    );

    res.json({
      success: true,
      data: {
        overall: overall.rows[0],
        subjects: stats,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single attendance record with lock status — for inline editing.
 */
export async function getSingleAttendance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT a.*,
              EXTRACT(EPOCH FROM (NOW() - a.created_at)) / 3600 as hours_since_creation,
              u.name as student_name, s.roll_no,
              sub.name as subject_name, sub.code as subject_code
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN subjects sub ON sub.id = a.subject_id
       WHERE a.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      throw new AppError("Attendance record not found.", 404);
    }

    const row = result.rows[0];
    const hoursSince = parseFloat(row.hours_since_creation || "0");
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const isDateOld = new Date(row.date) < twoDaysAgo;
    const editable = !isDateOld && hoursSince <= EDIT_WINDOW_HOURS;

    res.json({
      success: true,
      data: {
        ...row,
        editable,
        lock_reason: !editable
          ? isDateOld
            ? `Attendance date is beyond the 2-day edit window.`
            : `Record was created ${Math.round(hoursSince)} hours ago. Edit window is ${EDIT_WINDOW_HOURS} hours.`
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
}
