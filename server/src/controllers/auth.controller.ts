import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { JwtPayload, UserRole } from "../middleware/auth.js";

// ─── Domain-to-role mapping ─────────────────────────────
const DOMAIN_ROLE_MAP: Record<string, UserRole> = {
  "admin.in": "admin",
  "faculty.in": "faculty",
  "jlu.edu.in": "student",
};

function detectRoleFromEmail(email: string): UserRole | null {
  const domain = email.split("@")[1]?.toLowerCase();
  return DOMAIN_ROLE_MAP[domain] || null;
}

// ─── Login ──────────────────────────────────────────────
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required." });
      return;
    }

    // Detect role from email domain
    const detectedRole = detectRoleFromEmail(email);
    if (!detectedRole) {
      res.status(400).json({
        success: false,
        error: "Invalid email domain. Use @admin.in, @faculty.in, or @jlu.edu.in",
      });
      return;
    }

    console.log(`[AUTH] Login attempt: ${email} → detected role: ${detectedRole}`);

    // Try to find existing user
    const result = await query(
      "SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1",
      [email]
    );

    let user = result.rows[0];

    if (!user) {
      // Create user on-the-fly if they don't exist
      console.log(`[AUTH] Creating new user: ${email} (${detectedRole})`);
      const defaultPassword = await bcrypt.hash("password123", 12);

      const newUser = await query(
        `INSERT INTO users (name, email, role, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, is_active`,
        [email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), email, detectedRole, defaultPassword]
      );
      user = newUser.rows[0];

      // Create profile based on role
      if (detectedRole === "student") {
        // Get or create default course
        let courseRes = await query("SELECT id FROM courses LIMIT 1");
        if (courseRes.rows.length === 0) {
          courseRes = await query(
            `INSERT INTO courses (name, code, description, duration_years)
             VALUES ('General Course', 'GEN01', 'Default course', 4)
             RETURNING id`
          );
        }
        const courseId = courseRes.rows[0].id;

        // Get next roll number
        const countRes = await query("SELECT COUNT(*) FROM students");
        const count = parseInt(countRes.rows[0].count) + 1;

        await query(
          `INSERT INTO students (user_id, course_id, roll_no, semester, batch_year)
           VALUES ($1, $2, $3, 1, $4)
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id, courseId, `STU${String(count).padStart(5, "0")}`, new Date().getFullYear()]
        );
      } else if (detectedRole === "faculty") {
        await query(
          `INSERT INTO faculty (user_id, department, qualification)
           VALUES ($1, 'General', 'Faculty Member')
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id]
        );
      }

      console.log(`[AUTH] User created with role: ${detectedRole}`);
    }

    // Verify password — accept "password123" for any user, or check existing hash
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid && password !== "password123" && password !== "demo") {
      // For demo purposes, also accept "demo" as universal password
      res.status(401).json({ success: false, error: "Invalid email or password." });
      return;
    }

    // Generate JWT
    const domain = email.split("@")[1]?.toLowerCase() || "";
    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      domain,
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    // Fetch profile
    let profile: Record<string, any> = {};
    if (user.role === "student") {
      const profRes = await query(
        `SELECT s.id as profile_id, s.roll_no, s.semester, s.course_id,
                c.name as course_name, c.code as course_code
         FROM students s LEFT JOIN courses c ON c.id = s.course_id
         WHERE s.user_id = $1`,
        [user.id]
      );
      if (profRes.rows[0]) profile = profRes.rows[0];
    } else if (user.role === "faculty") {
      const profRes = await query(
        `SELECT id as profile_id, department, qualification FROM faculty WHERE user_id = $1`,
        [user.id]
      );
      if (profRes.rows[0]) profile = profRes.rows[0];
    }

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          ...profile,
        },
      },
    });
  } catch (error) {
    console.error("[AUTH] Error:", error);
    next(error);
  }
}

// ─── Get Current User ───────────────────────────────────
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query(
      `SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1`,
      [req.user!.userId]
    );

    if (!result.rows[0]) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }

    const user = result.rows[0];
    let profile: Record<string, any> = {};

    if (user.role === "student") {
      const profRes = await query(
        `SELECT s.id as profile_id, s.roll_no, s.semester, s.batch_year, s.course_id,
                c.name as course_name, c.code as course_code
         FROM students s LEFT JOIN courses c ON c.id = s.course_id
         WHERE s.user_id = $1`,
        [user.id]
      );
      if (profRes.rows[0]) profile = profRes.rows[0];
    } else if (user.role === "faculty") {
      const profRes = await query(
        `SELECT id as profile_id, department, qualification FROM faculty WHERE user_id = $1`,
        [user.id]
      );
      if (profRes.rows[0]) profile = profRes.rows[0];
    }

    res.json({ success: true, data: { ...user, ...profile } });
  } catch (error) {
    next(error);
  }
}
