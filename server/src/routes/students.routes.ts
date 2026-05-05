import { Router } from "express";
import { studentsController } from "../controllers/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createStudentSchema, updateStudentSchema } from "../schemas/student.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "faculty"), studentsController.getStudents);
router.get("/:id", authorize("admin", "faculty"), studentsController.getStudentById);
router.post("/", authorize("admin"), validate(createStudentSchema), studentsController.createStudent);
router.put("/:id", authorize("admin"), validate(updateStudentSchema), studentsController.updateStudent);
router.delete("/:id", authorize("admin"), studentsController.deleteStudent);

export default router;
