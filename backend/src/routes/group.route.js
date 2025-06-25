
import express from "express";
import {
  createGroup,
  getAllGroups,
  getUserGroups,
  requestToJoinGroup,
  approveJoinRequest,
  updateGroupImage,
  deleteGroup,
  updateGroupInfo
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getAllGroups);
router.get("/my-groups", protectRoute, getUserGroups);
router.post("/:groupId/join", protectRoute, requestToJoinGroup);
router.post("/:groupId/approve", protectRoute, approveJoinRequest);
router.put("/:groupId/image", protectRoute, updateGroupImage);
router.put("/:groupId", protectRoute, updateGroupInfo);
router.delete("/:groupId", protectRoute, deleteGroup);

export default router;
    