import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { followUser, unfollowUser } from "../controllers/userController.js";

const router = express.Router();

router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);

export default router;
