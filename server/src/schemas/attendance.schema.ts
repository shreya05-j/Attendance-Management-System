import { z } from "zod";

export const markAttendanceSchema = z.object({
  subject_id: z.string().uuid("Invalid subject ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  records: z
    .array(
      z.object({
        student_id: z.string().uuid(),
        status: z.enum(["present", "absent", "late", "leave", "holiday"]),
      })
    )
    .min(1, "At least one attendance record is required"),
  remarks: z.string().max(500).default(""),
});

export const attendanceQuerySchema = z.object({
  student_id: z.string().uuid().optional(),
  subject_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: z
    .enum(["present", "absent", "late", "leave", "holiday"])
    .optional(),
  page: z.string().default("1"),
  limit: z.string().default("20"),
});
