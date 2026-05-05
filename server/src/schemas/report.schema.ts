import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

// Attendance report query
export const attendanceReportQuerySchema = z.object({
  date_from: dateString.optional(),
  date_to: dateString.optional(),
  subject_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  faculty_id: z.string().uuid().optional(),
  status: z.enum(["present", "absent", "late", "leave", "holiday"]).optional(),
  format: z.enum(["json", "summary"]).default("json"),
});

// Student attendance summary
export const studentReportQuerySchema = z.object({
  student_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  semester: z.string().optional(),
  threshold: z.string().optional(),
});

// Faculty workload report
export const facultyReportQuerySchema = z.object({
  faculty_id: z.string().uuid().optional(),
  department: z.string().optional(),
});

// Course report
export const courseReportQuerySchema = z.object({
  course_id: z.string().uuid().optional(),
});

// Trend report
export const trendReportQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  date_from: dateString.optional(),
  date_to: dateString.optional(),
  course_id: z.string().uuid().optional(),
  subject_id: z.string().uuid().optional(),
});

// Low attendance alert report
export const lowAttendanceReportSchema = z.object({
  threshold: z.string().default("75"),
  course_id: z.string().uuid().optional(),
  semester: z.string().optional(),
});
