import { Request, Response, NextFunction } from "express";

/**
 * Custom application error.
 * Use `throw new AppError("message", statusCode)` in controllers
 * to send a structured error response.
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = "APP_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handler — catches all unhandled errors.
 * Returns a structured JSON response with HTTP status code.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Zod validation
  if (err.name === "ZodError") {
    res.status(400).json({
      success: false,
      error: "Validation error",
      code: "VALIDATION_ERROR",
      details: (err as any).errors,
    });
    return;
  }

  // PostgreSQL errors
  const pgCode = (err as any).code;
  if (pgCode === "23505") {
    res.status(409).json({
      success: false,
      error: "A record with this data already exists",
      code: "DUPLICATE_ENTRY",
    });
    return;
  }
  if (pgCode === "23503") {
    res.status(400).json({
      success: false,
      error: "Referenced record does not exist",
      code: "FOREIGN_KEY_VIOLATION",
    });
    return;
  }
  if (pgCode === "23502") {
    res.status(400).json({
      success: false,
      error: "Required field is missing",
      code: "NOT_NULL_VIOLATION",
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: "Invalid authentication token",
      code: "INVALID_TOKEN",
    });
    return;
  }
  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: "Authentication token has expired",
      code: "TOKEN_EXPIRED",
    });
    return;
  }

  // JSON parse error
  if ((err as any).type === "entity.parse.failed") {
    res.status(400).json({
      success: false,
      error: "Invalid JSON in request body",
      code: "INVALID_JSON",
    });
    return;
  }

  // Fallback — generic 500
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    code: "INTERNAL_ERROR",
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: "ROUTE_NOT_FOUND",
  });
}
