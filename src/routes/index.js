import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import commentRoutes from "../modules/comments/comment.routes.js";
import feedRoutes from "../modules/feed/feed.routes.js";
import healthRoutes from "../modules/health/health.route.js";
import likeRoutes from "../modules/likes/like.routes.js";
import postRoutes from "../modules/posts/post.routes.js";
import userRoutes from "../modules/users/user.routes.js";
const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/likes", likeRoutes);
router.use("/comments", commentRoutes);
router.use("/feed", feedRoutes);

export default router;