import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { query } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { validateEmailDomain, UserRole } from "../middleware/auth.js";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password, role } = req.body;

    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      throw new AppError("A user with this email already exists.", 409);
    }

    if (!validateEmailDomain(email, role)) {
      throw new AppError(
        `Email ${email} does not match role "${role}". ` +
          `Expected domain: @${role === "admin" ? "admin" : role === "faculty" ? "faculty" : "jlu.edu"}.in`,
        400
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, role, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, role, password_hash]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(
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

    if (req.query.role) {
      conditions.push(`u.role = $${idx++}`);
      values.push(req.query.role);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await query(`SELECT COUNT(*) FROM users u ${where}`, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch users with optional student/faculty profiles attached
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
              s.id as student_id, s.roll_no, s.semester, s.batch_year, s.course_id,
              c.name as course_name, c.code as course_code,
              f.id as faculty_id, f.department, f.qualification
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id AND s.is_active = true
       LEFT JOIN courses c ON c.id = s.course_id
       LEFT JOIN faculty f ON f.user_id = u.id AND f.is_active = true
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]
    );

    // Clean up response: combine user + profile into one object
    const data = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      is_active: row.is_active,
      created_at: row.created_at,
      ...(row.student_id
        ? {
            profile_id: row.student_id,
            roll_no: row.roll_no,
            semester: row.semester,
            batch_year: row.batch_year,
            course_id: row.course_id,
            course_name: row.course_name,
            course_code: row.course_code,
          }
        : {}),
      ...(row.faculty_id
        ? {
            profile_id: row.faculty_id,
            department: row.department,
            qualification: row.qualification,
          }
        : {}),
    }));

    res.json({
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
              s.id as student_id, s.roll_no, s.semester, s.batch_year, s.course_id,
              c.name as course_name, c.code as course_code,
              f.id as faculty_id, f.department, f.qualification
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id AND s.is_active = true
       LEFT JOIN courses c ON c.id = s.course_id
       LEFT JOIN faculty f ON f.user_id = u.id AND f.is_active = true
       WHERE u.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      throw new AppError("User not found.", 404);
    }

    const row = result.rows[0];
    const data: any = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      is_active: row.is_active,
      created_at: row.created_at,
    };

    if (row.student_id) {
      data.profile_id = row.student_id;
      data.roll_no = row.roll_no;
      data.semester = row.semester;
      data.batch_year = row.batch_year;
      data.course_id = row.course_id;
      data.course_name = row.course_name;
      data.course_code = row.course_code;
    }
    if (row.faculty_id) {
      data.profile_id = row.faculty_id;
      data.department = row.department;
      data.qualification = row.qualification;
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ["name", "email", "is_active"];

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(fields[field]);
      }
    }

    if (updates.length === 0) {
      throw new AppError("No valid fields to update.", 400);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx}
       RETURNING id, name, email, role, is_active, created_at`,
      values
    );

    if (!result.rows[0]) {
      throw new AppError("User not found.", 404);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (!result.rows[0]) {
      throw new AppError("User not found.", 404);
    }

    res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
}
