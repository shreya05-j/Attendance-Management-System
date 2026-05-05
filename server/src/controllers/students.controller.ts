import { Request, Response, NextFunction } from "express";
import { query } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

export async function createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, course_id, roll_no, semester, batch_year } = req.body;

    // Check user exists and is a student
    const user = await query("SELECT id, role FROM users WHERE id = $1", [user_id]);
    if (!user.rows[0]) throw new AppError("User not found.", 404);
    if (user.rows[0].role !== "student") {
      throw new AppError("User must have role 'student' to create a student profile.", 400);
    }

    const existing = await query("SELECT id FROM students WHERE user_id = $1", [user_id]);
    if (existing.rows.length > 0) {
      throw new AppError("Student profile already exists for this user.", 409);
    }

    const result = await query(
      `INSERT INTO students (user_id, course_id, roll_no, semester, batch_year)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, course_id, roll_no, semester, batch_year]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (req.query.course_id) {
      conditions.push(`s.course_id = $${idx++}`);
      values.push(req.query.course_id);
    }
    if (req.query.semester) {
      conditions.push(`s.semester = $${idx++}`);
      values.push(parseInt(req.query.semester as string));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await query(`SELECT COUNT(*) FROM students s ${where}`, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT s.*, u.name, u.email, u.is_active as user_active,
              c.name as course_name, c.code as course_code
       FROM students s
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = s.course_id
       ${where}
       ORDER BY s.roll_no
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

export async function getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT s.*, u.name, u.email, u.is_active as user_active, u.created_at as user_created_at,
              c.name as course_name, c.code as course_code
       FROM students s
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = s.course_id
       WHERE s.id = $1`,
      [id]
    );
    if (!result.rows[0]) throw new AppError("Student not found.", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ["course_id", "roll_no", "semester", "batch_year", "is_active"];

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(fields[field]);
      }
    }

    if (updates.length === 0) throw new AppError("No valid fields to update.", 400);

    updates.push("updated_at = NOW()");
    values.push(id);

    const result = await query(
      `UPDATE students SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!result.rows[0]) throw new AppError("Student not found.", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM students WHERE id = $1 RETURNING id", [id]);
    if (!result.rows[0]) throw new AppError("Student not found.", 404);
    res.json({ success: true, message: "Student profile deleted successfully." });
  } catch (error) {
    next(error);
  }
}
