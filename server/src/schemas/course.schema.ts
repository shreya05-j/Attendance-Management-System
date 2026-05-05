import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(2, "Course name is required").max(200),
  code: z.string().min(2, "Course code is required").max(20),
  description: z.string().max(1000).default(""),
  duration_years: z.number().int().min(1).max(8).default(4),
});

export const updateCourseSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  code: z.string().min(2).max(20).optional(),
  description: z.string().max(1000).optional(),
  duration_years: z.number().int().min(1).max(8).optional(),
  is_active: z.boolean().optional(),
});
