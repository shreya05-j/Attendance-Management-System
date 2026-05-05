import { z } from "zod";

export const createLeaveSchema = z.object({
  leave_type: z.enum(["sick", "casual", "annual", "other"]),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  reason: z.string().max(1000).default(""),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});
