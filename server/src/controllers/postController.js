import Post from "../models/Post.js";
import createNotification from "../utils/createNotification.js";

/* =======================
   CREATE POST
======================= */
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const photo = req.file ? req.file.path : "";

    if (!content && !photo) {
      return res
        .status(400)
        .json({ message: "Post must have text or image" });
    }

    const post = await Post.create({
      content: content || "",
      photo,
      user: req.user._id
    });

    // Populate user before returning
    await post.populate("user", "username email");

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   GET ALL POSTS (PAGINATED)
======================= */
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   LIKE / UNLIKE POST
======================= */
export const likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id;
    // Properly check if user already liked the post using ObjectId comparison
    const isLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (isLiked) {
      // UNLIKE
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // LIKE
      post.likes.push(userId);

      // 🔔 Notify post owner (no self-notification)
      if (post.user.toString() !== userId.toString()) {
        await createNotification({
          user: post.user,
          sender: userId,
          type: "like",
          post: post._id
        });
      }
    }

    await post.save();

    // Populate user before returning
    await post.populate("user", "username email");

    res.json({
      message: isLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   ADD COMMENT
======================= */
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: req.user._id,
      text: text.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Populate comment user before returning
    await post.populate("comments.user", "username email");

    // 🔔 Notify post owner (no self-notification)
    if (post.user.toString() !== req.user._id.toString()) {
      await createNotification({
        user: post.user,
        sender: req.user._id,
        type: "comment",
        post: post._id
      });
    }

    res.status(201).json({
      message: "Comment added",
      comment: post.comments[post.comments.length - 1],
      comments: post.comments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   GET COMMENTS
======================= */
export const getPostComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "comments.user",
      "username email"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   DELETE COMMENT (OWNER ONLY)
======================= */
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      post.comments[commentIndex].user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   DELETE POST (OWNER ONLY)
======================= */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   UPDATE POST (OWNER ONLY)
======================= */
export const updatePost = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (content !== undefined) {
      if (!content.trim() && !post.photo) {
        return res.status(400).json({ message: "Post must have text or image" });
      }
      post.content = content.trim();
    }

    await post.save();
    
    // Populate user before returning
    await post.populate("user", "username email");

    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   GET PERSONALIZED FEED
======================= */
export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Only show posts from users the current user follows (not their own posts)
    // Ensure following array contains ObjectIds (not populated objects)
    const userIds = req.user.following.map(id => 
      typeof id === 'object' ? id._id || id : id
    );

    // If user is not following anyone, return empty feed
    if (userIds.length === 0) {
      return res.json({
        page,
        limit,
        totalPosts: 0,
        totalPages: 0,
        posts: []
      });
    }

    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({
      user: { $in: userIds }
    });

    res.json({
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   GET USER POSTS
======================= */
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: userId })
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ user: userId });

    res.json({
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};