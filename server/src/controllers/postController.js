import Post from "../models/Post.js";
import mongoose from "mongoose";

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { content, photo } = req.body;

    if (!content && !photo) {
      return res
        .status(400)
        .json({ message: "Post must have text or photo" });
    }

    const post = await Post.create({
      content,
      photo,
      user: req.user._id
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL POSTS
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LIKE / UNLIKE POST
export const likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id;

    // check if already liked
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // UNLIKE
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // LIKE
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: isLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: req.user._id,
      text
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      message: "Comment added",
      comments: post.comments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET COMMENTS
export const getPostComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("comments.user", "username email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // find comment
    const commentIndex = post.comments.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // authorization: only comment owner
    if (
      post.comments[commentIndex].user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // remove comment
    post.comments.splice(commentIndex, 1);

    await post.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE POST (OWNER ONLY)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // authorization: only owner
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE POST (OWNER ONLY)
export const updatePost = async (req, res) => {
  try {
    const { content, photo } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // authorization: only owner
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (content !== undefined) post.content = content;
    if (photo !== undefined) post.photo = photo;

    await post.save();

    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET PERSONALIZED FEED
export const getFeed = async (req, res) => {
  try {
    // include own posts + followed users posts
    const userIds = [...req.user.following, req.user._id];

    const posts = await Post.find({
      user: { $in: userIds }
    })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
