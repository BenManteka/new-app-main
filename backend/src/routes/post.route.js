import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  createPost,
  getAllPosts,
  likePost,
  getPostLikes,
  addComment,
  deleteComment,
  deletePost,
  getPostsByGroup
} from '../controllers/post.controller.js';

const router = express.Router();

router.post("/", protectRoute, createPost);
router.get("/", protectRoute, getAllPosts);
router.post("/:id/like", protectRoute, likePost);
router.get("/:id/likes", protectRoute, getPostLikes);
router.post("/:id/comments", protectRoute, addComment);
router.delete("/:postId/comments/:commentId", protectRoute, deleteComment);
router.delete("/:postId", protectRoute, deletePost);

// ✅ GET posts by group
router.get("/group/:groupId", protectRoute, getPostsByGroup);

export default router;
