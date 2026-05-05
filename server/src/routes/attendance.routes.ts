import { Router } from "express";
import { attendanceController } from "../controllers/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { markAttendanceSchema, attendanceQuerySchema } from "../schemas/attendance.schema.js";

const router = Router();

router.use(authenticate);

// ─── Static routes FIRST (before /:id) ──────────────────

// Faculty marks attendance (bulk)
router.post(
  "/mark",
  authorize("faculty", "admin"),
  validate(markAttendanceSchema),
  attendanceController.markAttendance
);

// Get attendance records for marking UI (with lock status)
router.get(
  "/mark-data",
  authorize("faculty", "admin"),
  attendanceController.getAttendanceForMarking
);

// Student views own attendance
router.get("/my", attendanceController.getMyAttendance);
router.get("/summary", attendanceController.getAttendanceSummary);

// Get attendance (faculty/admin view all)
router.get(
  "/",
  authorize("admin", "faculty"),
  validate(attendanceQuerySchema, "query"),
  attendanceController.getAttendance
);

// ─── Dynamic routes LAST ────────────────────────────────

// Get single attendance record with editability check
router.get(
  "/:id",
  attendanceController.getSingleAttendance
);

export default router;
