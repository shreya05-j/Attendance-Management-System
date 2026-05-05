import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(2, "Subject name is required").max(200),
  code: z.string().min(2, "Subject code is required").max(20),
  course_id: z.string().uuid(),
  faculty_id: z.string().uuid().nullable().default(null),
  semester: z.number().int().min(1).max(12),
  credits: z.number().int().min(1).max(6).default(3),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  code: z.string().min(2).max(20).optional(),
  faculty_id: z.string().uuid().nullable().optional(),
  semester: z.number().int().min(1).max(12).optional(),
  credits: z.number().int().min(1).max(6).optional(),
  is_active: z.boolean().optional(),
});
