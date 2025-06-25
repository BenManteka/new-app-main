
import Post from "../models/post.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { text, image, groupId } = req.body;
    const userId = req.user._id;

    if (!text.trim()) return res.status(400).json({ message: "Text is required" });

    let imageUrl = null;
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    const newPost = new Post({ userId, text, image: imageUrl, groupId });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ groupId: null })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName profilePic")
      .populate("comments.userId", "fullName profilePic")
      .populate("likes", "fullName profilePic");
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (err) {
    console.error("Error in likePost:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostLikes = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("likes", "fullName profilePic");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post.likes);
  } catch (err) {
    console.error("Error fetching likes:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { userId: req.user._id, text };
    post.comments.push(comment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate("comments.userId", "fullName profilePic");

    res.status(201).json(updatedPost.comments);
  } catch (err) {
    console.error("Error in addComment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (
      comment.userId.toString() !== userId.toString() &&
      post.userId.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    post.comments.pull(commentId);
    await post.save();
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.deleteOne({ _id: req.params.postId });
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostsByGroup = async (req, res) => {
  try {
    const posts = await Post.find({ groupId: req.params.groupId })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName profilePic")
      .populate("comments.userId", "fullName profilePic")
      .populate("likes", "fullName profilePic");

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching group posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
