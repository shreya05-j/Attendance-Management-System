import { Router } from "express";
import { subjectsController } from "../controllers/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createSubjectSchema, updateSubjectSchema } from "../schemas/subject.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", subjectsController.getSubjects);
router.get("/:id", subjectsController.getSubjectById);

router.post("/", authorize("admin"), validate(createSubjectSchema), subjectsController.createSubject);
router.put("/:id", authorize("admin"), validate(updateSubjectSchema), subjectsController.updateSubject);
router.delete("/:id", authorize("admin"), subjectsController.deleteSubject);

export default router;
