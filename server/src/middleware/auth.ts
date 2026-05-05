import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type UserRole = "admin" | "faculty" | "student";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  domain: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── Domain → Role mapping ──────────────────────────────
export const EMAIL_DOMAIN_ROLES: Record<string, UserRole> = {
  "admin.in": "admin",
  "faculty.in": "faculty",
  "jlu.edu.in": "student",
};

export function detectRoleFromEmail(email: string): UserRole | null {
  const domain = email.split("@")[1]?.toLowerCase();
  return EMAIL_DOMAIN_ROLES[domain] || null;
}

export function validateEmailDomain(email: string, role: UserRole): boolean {
  return detectRoleFromEmail(email) === role;
}

// ─── Authenticate middleware (JWT) ──────────────────────
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authentication required. No token provided.",
      code: "UNAUTHORIZED",
    });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    const isExpired = err?.name === "TokenExpiredError";
    res.status(401).json({
      success: false,
      error: isExpired ? "Token has expired. Please log in again." : "Invalid token.",
      code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
    });
    return;
  }
}

// ─── Role-based authorization middleware ────────────────
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required.",
        code: "UNAUTHORIZED",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}.`,
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  };
}

// ─── Self-or-Role middleware ────────────────────────────
// Allows access if the user matches the resource (own profile) OR has elevated role.
export function authorizeSelfOr(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required.", code: "UNAUTHORIZED" });
      return;
    }
    const isSelf =
      req.user.userId === req.params.id ||
      req.user.userId === req.params.userId ||
      req.user.userId === req.params.user_id;
    const hasRole = roles.includes(req.user.role);

    if (!isSelf && !hasRole) {
      res.status(403).json({
        success: false,
        error: "You do not have permission to access this resource.",
        code: "FORBIDDEN",
      });
      return;
    }
    next();
  };
}
