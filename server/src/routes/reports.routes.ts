import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  attendanceReportQuerySchema,
  studentReportQuerySchema,
  facultyReportQuerySchema,
  trendReportQuerySchema,
  lowAttendanceReportSchema,
} from "../schemas/report.schema.js";
import * as reportsController from "../controllers/reports.controller.js";

const router = Router();

// All report endpoints require authentication
router.use(authenticate);

/**
 * REPORTS API
 * Base: /api/v1/reports
 *
 * All endpoints return:
 *   { success: true, data: ..., message?: string, meta?: { page, limit, total, totalPages } }
 *
 * Errors return:
 *   { success: false, error: string, code: string }
 */

// 1. Attendance report — full filterable list or summary mode
//    GET /reports/attendance?date_from=&date_to=&subject_id=&course_id=&student_id=&status=&format=json|summary
router.get(
  "/attendance",
  authorize("admin", "faculty"),
  validate(attendanceReportQuerySchema, "query"),
  reportsController.getAttendanceReport
);

// 2. Student performance report
//    GET /reports/students?student_id=&course_id=&semester=&threshold=
router.get(
  "/students",
  authorize("admin", "faculty"),
  validate(studentReportQuerySchema, "query"),
  reportsController.getStudentReport
);

// 3. Faculty workload report
//    GET /reports/faculty?faculty_id=&department=
router.get(
  "/faculty",
  authorize("admin"),
  validate(facultyReportQuerySchema, "query"),
  reportsController.getFacultyReport
);

// 4. Course performance report
//    GET /reports/courses
router.get(
  "/courses",
  authorize("admin", "faculty"),
  reportsController.getCourseReport
);

// 5. Trend report (daily, weekly, monthly)
//    GET /reports/trends?period=daily|weekly|monthly&date_from=&date_to=&course_id=&subject_id=
router.get(
  "/trends",
  authorize("admin", "faculty"),
  validate(trendReportQuerySchema, "query"),
  reportsController.getTrendReport
);

// 6. Low attendance alert report
//    GET /reports/low-attendance?threshold=75&course_id=&semester=
router.get(
  "/low-attendance",
  authorize("admin", "faculty"),
  validate(lowAttendanceReportSchema, "query"),
  reportsController.getLowAttendanceReport
);

// 7. Combined dashboard stats
//    GET /reports/dashboard
router.get(
  "/dashboard",
  authorize("admin", "faculty"),
  reportsController.getDashboardStats
);

// 8. Export-friendly raw data
//    GET /reports/export?type=attendance|students|subjects|faculty
router.get(
  "/export",
  authorize("admin", "faculty"),
  reportsController.getExportData
);

export default router;
