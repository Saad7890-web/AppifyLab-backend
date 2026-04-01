import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import healthRoutes from "../modules/health/health.route.js";
import userRoutes from "../modules/users/user.routes.js";


const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;