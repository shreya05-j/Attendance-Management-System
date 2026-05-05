import { Router } from "express";
import { facultyController } from "../controllers/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createFacultySchema, updateFacultySchema } from "../schemas/faculty.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "faculty"), facultyController.getFaculty);
router.get("/:id", authorize("admin", "faculty"), facultyController.getFacultyById);
router.post("/", authorize("admin"), validate(createFacultySchema), facultyController.createFacultyProfile);
router.put("/:id", authorize("admin"), validate(updateFacultySchema), facultyController.updateFacultyProfile);
router.delete("/:id", authorize("admin"), facultyController.deleteFacultyProfile);

export default router;
