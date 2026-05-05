import { z } from "zod";

export const createStudentSchema = z.object({
  user_id: z.string().uuid(),
  course_id: z.string().uuid(),
  roll_no: z.string().min(1, "Roll number is required").max(30),
  semester: z.number().int().min(1).max(12),
  batch_year: z.number().int().min(2000).max(2099),
});

export const updateStudentSchema = z.object({
  course_id: z.string().uuid().optional(),
  roll_no: z.string().min(1).max(30).optional(),
  semester: z.number().int().min(1).max(12).optional(),
  batch_year: z.number().int().min(2000).max(2099).optional(),
  is_active: z.boolean().optional(),
});
