import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { createPost, getAllPosts } from "../controllers/postController.js";
import { likeUnlikePost } from "../controllers/postController.js";
import { addComment, getPostComments } from "../controllers/postController.js";
import { deleteComment } from "../controllers/postController.js";
import { deletePost, updatePost } from "../controllers/postController.js";
import { getFeed } from "../controllers/postController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/feed", protect, getFeed);
router.post("/", protect, upload.single("photo"), createPost);
router.get("/", getAllPosts);
router.put("/:id/like", protect, likeUnlikePost);
router.post("/:id/comment", protect, addComment);
router.get("/:id/comments", getPostComments);
router.delete(
  "/:postId/comment/:commentId",
  protect,
  deleteComment
);
router.delete("/:id", protect, deletePost);
router.put("/:id", protect, updatePost);

export default router;
