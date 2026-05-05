import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import coursesRoutes from "./courses.routes.js";
import subjectsRoutes from "./subjects.routes.js";
import studentsRoutes from "./students.routes.js";
import facultyRoutes from "./faculty.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import leavesRoutes from "./leaves.routes.js";
import reportsRoutes from "./reports.routes.js";

const router = Router();

// ─── Module routes ──────────────────────────────────────
router.use("/auth", authRoutes);             // /api/v1/auth/*
router.use("/users", usersRoutes);           // /api/v1/users/*
router.use("/students", studentsRoutes);     // /api/v1/students/*
router.use("/faculty", facultyRoutes);       // /api/v1/faculty/*
router.use("/courses", coursesRoutes);       // /api/v1/courses/*
router.use("/subjects", subjectsRoutes);     // /api/v1/subjects/*
router.use("/attendance", attendanceRoutes); // /api/v1/attendance/*
router.use("/leaves", leavesRoutes);         // /api/v1/leaves/*
router.use("/reports", reportsRoutes);       // /api/v1/reports/*

// ─── Health & API info ──────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "development",
    },
    message: "Server is running",
  });
});

router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      name: "AMS — Attendance Management System API",
      version: "1.0.0",
      endpoints: {
        auth: "/api/v1/auth",
        users: "/api/v1/users",
        students: "/api/v1/students",
        faculty: "/api/v1/faculty",
        courses: "/api/v1/courses",
        subjects: "/api/v1/subjects",
        attendance: "/api/v1/attendance",
        leaves: "/api/v1/leaves",
        reports: "/api/v1/reports",
      },
    },
    message: "Welcome to AMS REST API",
  });
});

export default router;
