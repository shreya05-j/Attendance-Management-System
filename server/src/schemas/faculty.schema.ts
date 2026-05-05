import { z } from "zod";

export const createFacultySchema = z.object({
  user_id: z.string().uuid(),
  department: z.string().min(1, "Department is required").max(150),
  qualification: z.string().max(200).default(""),
});

export const updateFacultySchema = z.object({
  department: z.string().min(1).max(150).optional(),
  qualification: z.string().max(200).optional(),
  is_active: z.boolean().optional(),
});
