import { Router } from "express";
import { authController } from "../controllers/index.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Login — no Zod validation, handled manually in controller
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);

// Debug/test login
router.post("/debug-login", authController.login);

export default router;
