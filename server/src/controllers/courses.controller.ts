import { Request, Response, NextFunction } from "express";
import { query } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, code, description, duration_years } = req.body;

    const existing = await query("SELECT id FROM courses WHERE code = $1", [code]);
    if (existing.rows.length > 0) {
      throw new AppError("A course with this code already exists.", 409);
    }

    const result = await query(
      `INSERT INTO courses (name, code, description, duration_years)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, code, description, duration_years]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function getCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM subjects WHERE course_id = c.id AND is_active = true) as subject_count,
              (SELECT COUNT(*) FROM students WHERE course_id = c.id AND is_active = true) as student_count
       FROM courses c
       ORDER BY c.name`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

export async function getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM subjects WHERE course_id = c.id AND is_active = true) as subject_count,
              (SELECT COUNT(*) FROM students WHERE course_id = c.id AND is_active = true) as student_count
       FROM courses c WHERE c.id = $1`,
      [id]
    );

    if (!result.rows[0]) throw new AppError("Course not found.", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ["name", "code", "description", "duration_years", "is_active"];

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
      `UPDATE courses SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!result.rows[0]) throw new AppError("Course not found.", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM courses WHERE id = $1 RETURNING id", [id]);
    if (!result.rows[0]) throw new AppError("Course not found.", 404);
    res.json({ success: true, message: "Course deleted successfully." });
  } catch (error) {
    next(error);
  }
}

// Get subjects for a course
export async function getCourseSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT sub.*, u.name as faculty_name
       FROM subjects sub
       LEFT JOIN faculty f ON f.id = sub.faculty_id
       LEFT JOIN users u ON u.id = f.user_id
       WHERE sub.course_id = $1 AND sub.is_active = true
       ORDER BY sub.semester, sub.name`,
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}
