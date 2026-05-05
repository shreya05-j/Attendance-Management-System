import { Response } from "express";

/**
 * Standardized JSON response helpers.
 * Every API endpoint returns the same shape:
 *   { success, data?, message?, error?, meta? }
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// ─── Success responses ──────────────────────────────────
export function ok<T>(res: Response, data: T, message?: string, meta?: PaginationMeta): Response {
  const body: ApiSuccess<T> = { success: true, data };
  if (message) body.message = message;
  if (meta) body.meta = meta;
  return res.status(200).json(body);
}

export function created<T>(res: Response, data: T, message = "Resource created"): Response {
  return res.status(201).json({ success: true, data, message });
}

export function noContent(res: Response, message = "Operation successful"): Response {
  return res.status(200).json({ success: true, message });
}

// ─── Error responses ────────────────────────────────────
export function badRequest(res: Response, error: string, details?: any): Response {
  return res.status(400).json({ success: false, error, code: "BAD_REQUEST", details });
}

export function unauthorized(res: Response, error = "Authentication required"): Response {
  return res.status(401).json({ success: false, error, code: "UNAUTHORIZED" });
}

export function forbidden(res: Response, error = "Access denied"): Response {
  return res.status(403).json({ success: false, error, code: "FORBIDDEN" });
}

export function notFound(res: Response, error = "Resource not found"): Response {
  return res.status(404).json({ success: false, error, code: "NOT_FOUND" });
}

export function conflict(res: Response, error: string): Response {
  return res.status(409).json({ success: false, error, code: "CONFLICT" });
}

export function serverError(res: Response, error = "Internal server error"): Response {
  return res.status(500).json({ success: false, error, code: "INTERNAL_ERROR" });
}

// ─── Pagination helper ──────────────────────────────────
export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    total,
    totalPages: Math.ceil(total / Math.min(100, Math.max(1, limit))),
  };
}

export function parsePaginationParams(query: any): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
