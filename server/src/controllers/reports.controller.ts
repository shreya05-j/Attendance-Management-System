import { Request, Response, NextFunction } from "express";
import { query } from "../config/database.js";
import { ok, badRequest, notFound, parsePaginationParams, buildPagination } from "../utils/response.js";

/**
 * REPORTS CONTROLLER
 * Provides aggregated, filterable reports across attendance, students, faculty, and courses.
 */

// ─── 1. Attendance Report ───────────────────────────────
// GET /api/v1/reports/attendance
// Returns paginated attendance records with full joins
export async function getAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, offset } = parsePaginationParams(req.query);
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (req.query.date_from) { conditions.push(`a.date >= $${idx++}`); values.push(req.query.date_from); }
    if (req.query.date_to)   { conditions.push(`a.date <= $${idx++}`); values.push(req.query.date_to); }
    if (req.query.subject_id){ conditions.push(`a.subject_id = $${idx++}`); values.push(req.query.subject_id); }
    if (req.query.course_id) { conditions.push(`s.course_id = $${idx++}`); values.push(req.query.course_id); }
    if (req.query.student_id){ conditions.push(`a.student_id = $${idx++}`); values.push(req.query.student_id); }
    if (req.query.faculty_id){ conditions.push(`sub.faculty_id = $${idx++}`); values.push(req.query.faculty_id); }
    if (req.query.status)    { conditions.push(`a.status = $${idx++}`); values.push(req.query.status); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Total count
    const countRes = await query(
      `SELECT COUNT(*) FROM attendance a
       JOIN students s ON s.id = a.student_id
       JOIN subjects sub ON sub.id = a.subject_id
       ${where}`,
      values
    );
    const total = parseInt(countRes.rows[0].count, 10);

    // Summary mode = aggregated stats only
    if (req.query.format === "summary") {
      const summaryRes = await query(
        `SELECT
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE a.status = 'present') as present,
           COUNT(*) FILTER (WHERE a.status = 'absent') as absent,
           COUNT(*) FILTER (WHERE a.status = 'late') as late,
           COUNT(*) FILTER (WHERE a.status = 'leave') as leave_count,
           COUNT(*) FILTER (WHERE a.status = 'holiday') as holiday
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         JOIN subjects sub ON sub.id = a.subject_id
         ${where}`,
        values
      );
      const s = summaryRes.rows[0];
      const totalRecords = parseInt(s.total) || 0;
      const presentCount = parseInt(s.present) || 0;
      ok(res, {
        total: totalRecords,
        present: presentCount,
        absent: parseInt(s.absent) || 0,
        late: parseInt(s.late) || 0,
        leave: parseInt(s.leave_count) || 0,
        holiday: parseInt(s.holiday) || 0,
        attendance_percentage: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0,
      }, "Summary generated successfully");
      return;
    }

    // Full detail records
    const records = await query(
      `SELECT a.id, a.date, a.status, a.remarks,
              u.name as student_name, s.roll_no, s.semester,
              c.name as course_name, c.code as course_code,
              sub.name as subject_name, sub.code as subject_code,
              fu.name as marked_by_name
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = s.course_id
       JOIN subjects sub ON sub.id = a.subject_id
       LEFT JOIN faculty f ON f.id = a.marked_by
       LEFT JOIN users fu ON fu.id = f.user_id
       ${where}
       ORDER BY a.date DESC, sub.name
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    ok(res, records.rows, undefined, buildPagination(page, limit, total));
  } catch (error) {
    next(error);
  }
}

// ─── 2. Student Performance Report ─────────────────────
// GET /api/v1/reports/students
// Returns per-student attendance percentage, broken down by subject
export async function getStudentReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const conditions: string[] = ["s.is_active = true"];
    const values: any[] = [];
    let idx = 1;

    if (req.query.student_id) { conditions.push(`s.id = $${idx++}`); values.push(req.query.student_id); }
    if (req.query.course_id) { conditions.push(`s.course_id = $${idx++}`); values.push(req.query.course_id); }
    if (req.query.semester) { conditions.push(`s.semester = $${idx++}`); values.push(parseInt(req.query.semester as string)); }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const result = await query(
      `SELECT
         s.id, s.roll_no, s.semester, s.batch_year,
         u.name, u.email,
         c.name as course_name, c.code as course_code,
         COUNT(a.id) as total_classes,
         COUNT(a.id) FILTER (WHERE a.status = 'present') as present_count,
         COUNT(a.id) FILTER (WHERE a.status = 'absent') as absent_count,
         COUNT(a.id) FILTER (WHERE a.status = 'late') as late_count,
         CASE
           WHEN COUNT(a.id) > 0
           THEN ROUND(COUNT(a.id) FILTER (WHERE a.status = 'present')::numeric * 100 / COUNT(a.id), 2)
           ELSE 0
         END as attendance_percentage
       FROM students s
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = s.course_id
       LEFT JOIN attendance a ON a.student_id = s.id
       ${where}
       GROUP BY s.id, u.name, u.email, c.name, c.code
       ORDER BY attendance_percentage DESC, u.name`,
      values
    );

    // Optional threshold filter
    let rows = result.rows;
    if (req.query.threshold) {
      const t = parseFloat(req.query.threshold as string);
      rows = rows.filter((r: any) => parseFloat(r.attendance_percentage) < t);
    }

    ok(res, rows, `${rows.length} students returned`);
  } catch (error) {
    next(error);
  }
}

// ─── 3. Faculty Workload Report ────────────────────────
// GET /api/v1/reports/faculty
// Returns per-faculty subject count, total classes taken, avg attendance
export async function getFacultyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const conditions: string[] = ["f.is_active = true"];
    const values: any[] = [];
    let idx = 1;

    if (req.query.faculty_id) { conditions.push(`f.id = $${idx++}`); values.push(req.query.faculty_id); }
    if (req.query.department) { conditions.push(`f.department = $${idx++}`); values.push(req.query.department); }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const result = await query(
      `SELECT
         f.id as faculty_id, f.department, f.qualification,
         u.name, u.email,
         COUNT(DISTINCT sub.id) as subject_count,
         COUNT(a.id) as total_classes_marked,
         CASE
           WHEN COUNT(a.id) > 0
           THEN ROUND(COUNT(a.id) FILTER (WHERE a.status = 'present')::numeric * 100 / COUNT(a.id), 2)
           ELSE 0
         END as avg_attendance
       FROM faculty f
       JOIN users u ON u.id = f.user_id
       LEFT JOIN subjects sub ON sub.faculty_id = f.id AND sub.is_active = true
       LEFT JOIN attendance a ON a.subject_id = sub.id
       ${where}
       GROUP BY f.id, u.name, u.email
       ORDER BY u.name`,
      values
    );

    ok(res, result.rows, `${result.rows.length} faculty records returned`);
  } catch (error) {
    next(error);
  }
}

// ─── 4. Course Performance Report ───────────────────────
// GET /api/v1/reports/courses
export async function getCourseReport(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query(
      `SELECT
         c.id, c.name, c.code, c.duration_years,
         COUNT(DISTINCT s.id) as student_count,
         COUNT(DISTINCT sub.id) as subject_count,
         COUNT(a.id) as total_attendance_records,
         CASE
           WHEN COUNT(a.id) > 0
           THEN ROUND(COUNT(a.id) FILTER (WHERE a.status = 'present')::numeric * 100 / COUNT(a.id), 2)
           ELSE 0
         END as avg_attendance_percentage
       FROM courses c
       LEFT JOIN students s ON s.course_id = c.id AND s.is_active = true
       LEFT JOIN subjects sub ON sub.course_id = c.id AND sub.is_active = true
       LEFT JOIN attendance a ON a.student_id = s.id
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.name`
    );

    ok(res, result.rows, `${result.rows.length} courses returned`);
  } catch (error) {
    next(error);
  }
}

// ─── 5. Trend Report (Daily/Weekly/Monthly) ────────────
// GET /api/v1/reports/trends
export async function getTrendReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const period = (req.query.period as string) || "daily";
    const dateFrom = (req.query.date_from as string) || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const dateTo = (req.query.date_to as string) || new Date().toISOString().split("T")[0];

    const filters: string[] = [`a.date >= $1`, `a.date <= $2`];
    const values: any[] = [dateFrom, dateTo];
    let idx = 3;

    if (req.query.course_id) { filters.push(`s.course_id = $${idx++}`); values.push(req.query.course_id); }
    if (req.query.subject_id){ filters.push(`a.subject_id = $${idx++}`); values.push(req.query.subject_id); }

    const where = `WHERE ${filters.join(" AND ")}`;

    let groupBy = "DATE(a.date)";
    let dateExpr = "DATE(a.date)::text as period";

    if (period === "weekly") {
      groupBy = "DATE_TRUNC('week', a.date)";
      dateExpr = "DATE_TRUNC('week', a.date)::date::text as period";
    } else if (period === "monthly") {
      groupBy = "DATE_TRUNC('month', a.date)";
      dateExpr = "TO_CHAR(DATE_TRUNC('month', a.date), 'YYYY-MM') as period";
    }

    const result = await query(
      `SELECT
         ${dateExpr},
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE a.status = 'present') as present,
         COUNT(*) FILTER (WHERE a.status = 'absent') as absent,
         COUNT(*) FILTER (WHERE a.status = 'late') as late,
         CASE
           WHEN COUNT(*) > 0
           THEN ROUND(COUNT(*) FILTER (WHERE a.status = 'present')::numeric * 100 / COUNT(*), 2)
           ELSE 0
         END as attendance_percentage
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       ${where}
       GROUP BY ${groupBy}
       ORDER BY ${groupBy}`,
      values
    );

    ok(res, {
      period,
      date_from: dateFrom,
      date_to: dateTo,
      points: result.rows,
    }, "Trend data generated");
  } catch (error) {
    next(error);
  }
}

// ─── 6. Low Attendance Alert Report ────────────────────
// GET /api/v1/reports/low-attendance
export async function getLowAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const threshold = parseFloat((req.query.threshold as string) || "75");

    const conditions: string[] = ["s.is_active = true"];
    const values: any[] = [];
    let idx = 1;

    if (req.query.course_id) { conditions.push(`s.course_id = $${idx++}`); values.push(req.query.course_id); }
    if (req.query.semester) { conditions.push(`s.semester = $${idx++}`); values.push(parseInt(req.query.semester as string)); }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const result = await query(
      `SELECT * FROM (
         SELECT
           s.id, s.roll_no, s.semester,
           u.name, u.email,
           c.name as course_name,
           COUNT(a.id) as total_classes,
           COUNT(a.id) FILTER (WHERE a.status = 'present') as present_count,
           CASE
             WHEN COUNT(a.id) > 0
             THEN ROUND(COUNT(a.id) FILTER (WHERE a.status = 'present')::numeric * 100 / COUNT(a.id), 2)
             ELSE 0
           END as attendance_percentage
         FROM students s
         JOIN users u ON u.id = s.user_id
         JOIN courses c ON c.id = s.course_id
         LEFT JOIN attendance a ON a.student_id = s.id
         ${where}
         GROUP BY s.id, u.name, u.email, c.name
       ) sub
       WHERE attendance_percentage < $${idx} AND total_classes >= 5
       ORDER BY attendance_percentage ASC`,
      [...values, threshold]
    );

    // Add severity classification
    const enriched = result.rows.map((s: any) => ({
      ...s,
      severity: s.attendance_percentage < 50 ? "critical" :
                s.attendance_percentage < 65 ? "warning" : "notice",
    }));

    ok(res, enriched, `${enriched.length} students below ${threshold}% attendance`);
  } catch (error) {
    next(error);
  }
}

// ─── 7. Dashboard Stats (single endpoint with everything) ──
// GET /api/v1/reports/dashboard
export async function getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

    // Run all queries in parallel
    const [students, faculty, courses, subjects, attendanceStats, pendingLeaves, lowAtt] = await Promise.all([
      query(`SELECT COUNT(*) FROM students WHERE is_active = true`),
      query(`SELECT COUNT(*) FROM faculty WHERE is_active = true`),
      query(`SELECT COUNT(*) FROM courses WHERE is_active = true`),
      query(`SELECT COUNT(*) FROM subjects WHERE is_active = true`),
      query(
        `SELECT
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE status = 'present') as present
         FROM attendance WHERE date >= $1 AND date <= $2`,
        [thirtyDaysAgo, today]
      ),
      query(`SELECT COUNT(*) FROM leaves WHERE status = 'pending'`),
      query(
        `SELECT COUNT(*) FROM (
           SELECT s.id FROM students s
           LEFT JOIN attendance a ON a.student_id = s.id
           WHERE s.is_active = true
           GROUP BY s.id
           HAVING COUNT(a.id) >= 5 AND
             COUNT(a.id) FILTER (WHERE a.status = 'present')::float / COUNT(a.id) < 0.75
         ) sub`
      ),
    ]);

    const totalAtt = parseInt(attendanceStats.rows[0].total) || 0;
    const presentAtt = parseInt(attendanceStats.rows[0].present) || 0;
    const avgAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

    ok(res, {
      counts: {
        students: parseInt(students.rows[0].count) || 0,
        faculty: parseInt(faculty.rows[0].count) || 0,
        courses: parseInt(courses.rows[0].count) || 0,
        subjects: parseInt(subjects.rows[0].count) || 0,
      },
      attendance: {
        total_records: totalAtt,
        present_records: presentAtt,
        avg_percentage: avgAttendance,
        period: { from: thirtyDaysAgo, to: today },
      },
      alerts: {
        pending_leaves: parseInt(pendingLeaves.rows[0].count) || 0,
        low_attendance_students: parseInt(lowAtt.rows[0].count) || 0,
      },
      generated_at: new Date().toISOString(),
    }, "Dashboard stats generated");
  } catch (error) {
    next(error);
  }
}

// ─── 8. Export-friendly endpoint (raw rows) ────────────
// GET /api/v1/reports/export?type=attendance|students|subjects|low-attendance
export async function getExportData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const type = req.query.type as string;
    if (!type) {
      badRequest(res, "Query parameter 'type' is required");
      return;
    }

    let result;
    switch (type) {
      case "attendance":
        result = await query(
          `SELECT a.date, u.name as student_name, s.roll_no,
                  sub.code as subject_code, sub.name as subject_name,
                  c.name as course_name, a.status, a.remarks
           FROM attendance a
           JOIN students s ON s.id = a.student_id
           JOIN users u ON u.id = s.user_id
           JOIN courses c ON c.id = s.course_id
           JOIN subjects sub ON sub.id = a.subject_id
           ORDER BY a.date DESC LIMIT 5000`
        );
        break;
      case "students":
        result = await query(
          `SELECT s.roll_no, u.name, u.email, c.name as course, s.semester, s.batch_year, s.is_active
           FROM students s
           JOIN users u ON u.id = s.user_id
           JOIN courses c ON c.id = s.course_id
           ORDER BY s.roll_no`
        );
        break;
      case "subjects":
        result = await query(
          `SELECT sub.code, sub.name, c.name as course, u.name as faculty,
                  sub.semester, sub.credits, sub.is_active
           FROM subjects sub
           JOIN courses c ON c.id = sub.course_id
           LEFT JOIN faculty f ON f.id = sub.faculty_id
           LEFT JOIN users u ON u.id = f.user_id
           ORDER BY sub.code`
        );
        break;
      case "faculty":
        result = await query(
          `SELECT u.name, u.email, f.department, f.qualification,
                  COUNT(sub.id) as subject_count
           FROM faculty f
           JOIN users u ON u.id = f.user_id
           LEFT JOIN subjects sub ON sub.faculty_id = f.id AND sub.is_active = true
           WHERE f.is_active = true
           GROUP BY f.id, u.name, u.email
           ORDER BY u.name`
        );
        break;
      default:
        notFound(res, `Unknown export type: ${type}`);
        return;
    }

    ok(res, result.rows, `Export data for type='${type}' (${result.rows.length} rows)`);
  } catch (error) {
    next(error);
  }
}
