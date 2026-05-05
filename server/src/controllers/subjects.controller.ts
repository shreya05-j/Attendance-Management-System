import { Request, Response, NextFunction } from "express";
import { query } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

export async function createSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, code, course_id, faculty_id, semester, credits } = req.body;

    const existing = await query("SELECT id FROM subjects WHERE code = $1", [code]);
    if (existing.rows.length > 0) {
      throw new AppError("A subject with this code already exists.", 409);
    }

    const result = await query(
      `INSERT INTO subjects (name, code, course_id, faculty_id, semester, credits)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, code, course_id, faculty_id, semester, credits]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function getSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const conditions: string[] = ["sub.is_active = true"];
    const values: any[] = [];
    let idx = 1;

    if (req.query.course_id) {
      conditions.push(`sub.course_id = $${idx++}`);
      values.push(req.query.course_id);
    }
    if (req.query.faculty_id) {
      conditions.push(`sub.faculty_id = $${idx++}`);
      values.push(req.query.faculty_id);
    }
    if (req.query.semester) {
      conditions.push(`sub.semester = $${idx++}`);
      values.push(parseInt(req.query.semester as string));
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const result = await query(
      `SELECT sub.*, c.name as course_name, c.code as course_code,
              u.name as faculty_name, f.department as faculty_department
       FROM subjects sub
       JOIN courses c ON c.id = sub.course_id
       LEFT JOIN faculty f ON f.id = sub.faculty_id
       LEFT JOIN users u ON u.id = f.user_id
       ${where}
       ORDER BY sub.semester, sub.name`,
      values
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

export async function getSubjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT sub.*, c.name as course_name, c.code as course_code,
              u.name as faculty_name, f.department as faculty_department
       FROM subjects sub
       JOIN courses c ON c.id = sub.course_id
       LEFT JOIN faculty f ON f.id = sub.faculty_id
       LEFT JOIN users u ON u.id = f.user_id
       WHERE sub.id = $1`,
      [id]
    );

    if (!result.rows[0]) throw new AppError("Subject not found.", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ["name", "code", "faculty_id", "semester", "credits", "is_active"];

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
      `UPDATE subjects SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!result.rows[0]) throw new AppError("Subject not found.", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM subjects WHERE id = $1 RETURNING id", [id]);
    if (!result.rows[0]) throw new AppError("Subject not found.", 404);
    res.json({ success: true, message: "Subject deleted successfully." });
  } catch (error) {
    next(error);
  }
}
