import { Router } from "express";
import { coursesController } from "../controllers/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createCourseSchema, updateCourseSchema } from "../schemas/course.schema.js";

const router = Router();

router.use(authenticate);

// All authenticated users can view courses
router.get("/", coursesController.getCourses);
router.get("/:id", coursesController.getCourseById);
router.get("/:id/subjects", coursesController.getCourseSubjects);

// Only admin can modify
router.post("/", authorize("admin"), validate(createCourseSchema), coursesController.createCourse);
router.put("/:id", authorize("admin"), validate(updateCourseSchema), coursesController.updateCourse);
router.delete("/:id", authorize("admin"), coursesController.deleteCourse);

export default router;
