import { Request, Response, NextFunction } from "express";
import { query } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

export async function createFacultyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user_id, department, qualification } = req.body;

    const user = await query("SELECT id, role FROM users WHERE id = $1", [user_id]);
    if (!user.rows[0]) throw new AppError("User not found.", 404);
    if (user.rows[0].role !== "faculty") {
      throw new AppError("User must have role 'faculty' to create a faculty profile.", 400);
    }

    const existing = await query("SELECT id FROM faculty WHERE user_id = $1", [user_id]);
    if (existing.rows.length > 0) {
      throw new AppError("Faculty profile already exists for this user.", 409);
    }

    const result = await query(
      `INSERT INTO faculty (user_id, department, qualification)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, department, qualification]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function getFaculty(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (req.query.department) {
      conditions.push(`f.department = $${idx++}`);
      values.push(req.query.department);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await query(
      `SELECT f.*, u.name, u.email, u.is_active as user_active
       FROM faculty f
       JOIN users u ON u.id = f.user_id
       ${where}
       ORDER BY u.name`,
      values
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

export async function getFacultyById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT f.*, u.name, u.email, u.is_active as user_active, u.created_at as user_created_at,
              (SELECT COUNT(*) FROM subjects WHERE faculty_id = f.id AND is_active = true) as subject_count
       FROM faculty f
       JOIN users u ON u.id = f.user_id
       WHERE f.id = $1`,
      [id]
    );
    if (!result.rows[0]) throw new AppError("Faculty not found.", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateFacultyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ["department", "qualification", "is_active"];

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
      `UPDATE faculty SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!result.rows[0]) throw new AppError("Faculty not found.", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteFacultyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM faculty WHERE id = $1 RETURNING id", [id]);
    if (!result.rows[0]) throw new AppError("Faculty not found.", 404);
    res.json({ success: true, message: "Faculty profile deleted successfully." });
  } catch (error) {
    next(error);
  }
}
