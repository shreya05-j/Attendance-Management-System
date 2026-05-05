import { Router } from "express";
import { leavesController } from "../controllers/index.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createLeaveSchema, updateLeaveStatusSchema } from "../schemas/leave.schema.js";

const router = Router();

router.use(authenticate);

// Students can view own leaves and request new ones
router.get("/my", leavesController.getMyLeaves);
router.post("/", validate(createLeaveSchema), leavesController.requestLeave);

// Faculty & Admin can view all leaves and approve/reject
router.get("/", authorize("admin", "faculty"), leavesController.getLeaves);
router.put(
  "/:id/status",
  authorize("admin", "faculty"),
  validate(updateLeaveStatusSchema),
  leavesController.updateLeaveStatus
);

export default router;
