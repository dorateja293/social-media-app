import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { followUser, unfollowUser, getUser, searchUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/:id", protect, getUser);
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);

export default router;
