import { Request, Response, NextFunction } from "express";
import { query } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

export async function requestLeave(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { leave_type, start_date, end_date, reason } = req.body;

    // Get student profile
    const stuRes = await query("SELECT id FROM students WHERE user_id = $1 AND is_active = true", [userId]);
    if (!stuRes.rows[0]) {
      throw new AppError("Student profile not found. Only students can request leaves.", 404);
    }
    const studentId = stuRes.rows[0].id;

    // Check for overlapping leaves
    const overlap = await query(
      `SELECT id FROM leaves WHERE student_id = $1 AND status != 'rejected'
       AND start_date <= $2 AND end_date >= $3`,
      [studentId, end_date, start_date]
    );

    if (overlap.rows.length > 0) {
      throw new AppError("You already have a leave request overlapping these dates.", 400);
    }

    const result = await query(
      `INSERT INTO leaves (student_id, leave_type, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [studentId, leave_type, start_date, end_date, reason]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function getLeaves(
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
      conditions.push(`l.student_id = $${idx++}`);
      values.push(req.query.student_id);
    }
    if (req.query.status) {
      conditions.push(`l.status = $${idx++}`);
      values.push(req.query.status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await query(`SELECT COUNT(*) FROM leaves l ${where}`, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT l.*, u.name as student_name, u.email as student_email,
              s.roll_no, s.semester,
              c.name as course_name,
              appr.name as approved_by_name
       FROM leaves l
       JOIN students s ON s.id = l.student_id
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = s.course_id
       LEFT JOIN faculty f ON f.id = l.approved_by
       LEFT JOIN users appr ON appr.id = f.user_id
       ${where}
       ORDER BY l.created_at DESC
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

export async function getMyLeaves(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const stuRes = await query("SELECT id FROM students WHERE user_id = $1", [userId]);
    if (!stuRes.rows[0]) throw new AppError("Student profile not found.", 404);
    const studentId = stuRes.rows[0].id;

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const countResult = await query(
      "SELECT COUNT(*) FROM leaves WHERE student_id = $1",
      [studentId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT l.*, appr.name as approved_by_name
       FROM leaves l
       LEFT JOIN faculty f ON f.id = l.approved_by
       LEFT JOIN users appr ON appr.id = f.user_id
       WHERE l.student_id = $1
       ORDER BY l.created_at DESC
       LIMIT $2 OFFSET $3`,
      [studentId, limit, offset]
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

export async function updateLeaveStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get faculty profile of the approver
    const facRes = await query(
      "SELECT id FROM faculty WHERE user_id = $1 AND is_active = true",
      [req.user!.userId]
    );
    if (!facRes.rows[0]) {
      throw new AppError("Faculty profile not found. Only faculty can approve leaves.", 403);
    }
    const facultyId = facRes.rows[0].id;

    const leave = await query("SELECT * FROM leaves WHERE id = $1", [id]);
    if (!leave.rows[0]) {
      throw new AppError("Leave request not found.", 404);
    }
    if (leave.rows[0].status !== "pending") {
      throw new AppError("Leave request has already been processed.", 400);
    }

    const result = await query(
      `UPDATE leaves SET status = $1, approved_by = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, facultyId, id]
    );

    // If approved, mark attendance as 'leave' for those dates
    if (status === "approved") {
      const { student_id, start_date, end_date } = leave.rows[0];
      const start = new Date(start_date);
      const end = new Date(end_date);

      // Get subjects for the student's course & semester
      const subjects = await query(
        `SELECT sub.id FROM subjects sub
         JOIN students s ON s.course_id = sub.course_id
         WHERE s.id = $1 AND sub.semester = s.semester AND sub.is_active = true`,
        [student_id]
      );

      const current = new Date(start);
      while (current <= end) {
        if (current.getDay() !== 0 && current.getDay() !== 6) {
          const dateStr = current.toISOString().split("T")[0];
          for (const sub of subjects.rows) {
            await query(
              `INSERT INTO attendance (student_id, subject_id, date, status, remarks)
               VALUES ($1, $2, $3, 'leave', 'Approved leave')
               ON CONFLICT (student_id, subject_id, date)
               DO UPDATE SET status = 'leave', remarks = 'Approved leave', updated_at = NOW()`,
              [student_id, sub.id, dateStr]
            );
          }
        }
        current.setDate(current.getDate() + 1);
      }
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}
