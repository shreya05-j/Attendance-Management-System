import { Router } from "express";
import { usersController } from "../controllers/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, updateUserSchema } from "../schemas/auth.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "faculty"), usersController.getUsers);
router.get("/:id", authorize("admin", "faculty"), usersController.getUserById);
router.post("/", authorize("admin"), validate(createUserSchema), usersController.createUser);
router.put("/:id", authorize("admin"), validate(updateUserSchema), usersController.updateUser);
router.delete("/:id", authorize("admin"), usersController.deleteUser);

export default router;
