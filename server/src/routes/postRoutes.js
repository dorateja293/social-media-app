import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { createPost, getAllPosts } from "../controllers/postController.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getAllPosts);

export default router;
