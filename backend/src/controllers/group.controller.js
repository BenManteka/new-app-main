
import cloudinary from "../lib/cloudinary.js";
import Group from "../models/group.model.js";

// יצירת קבוצה
export const createGroup = async (req, res) => {
  try {
    const { name, description, password, image } = req.body;

    let imageUrl = null;
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    const group = new Group({
      name,
      description,
      password,
      image: imageUrl,
      creator: req.user._id,
      members: [req.user._id],
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Failed to create group" });
  }
};

// שליפת כל הקבוצות
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("creator", "name");
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Failed to load groups" });
  }
};

// שליפת קבוצות של המשתמש
export const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Failed to load user groups" });
  }
};

// בקשת הצטרפות
export const requestToJoinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (
      group.members.includes(req.user._id) ||
      group.pendingRequests.includes(req.user._id)
    ) {
      return res.status(400).json({ message: "Already joined or requested" });
    }

    group.pendingRequests.push(req.user._id);
    await group.save();
    res.status(200).json({ message: "Join request sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to request join" });
  }
};

// אישור הצטרפות
export const approveJoinRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.creator.equals(req.user._id)) {
      return res.status(403).json({ message: "Only creator can approve" });
    }

    group.pendingRequests.pull(userId);
    group.members.push(userId);
    await group.save();
    res.status(200).json({ message: "User approved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve user" });
  }
};

// שינוי תמונת קבוצה
export const updateGroupImage = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { image } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the creator can update image" });
    }

    let imageUrl = null;
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    group.image = imageUrl;
    await group.save();

    res.status(200).json({ message: "Image updated", image: imageUrl });
  } catch (error) {
    console.error("Failed to update group image", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ פונקציית מחיקה חדשה
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.creator.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the creator can delete the group" });
    }

    await group.deleteOne();
    res.status(200).json({ message: "Group deleted" });
  } catch (err) {
    console.error("Failed to delete group:", err);
    res.status(500).json({ message: "Failed to delete group" });
  }
};
    
// עדכון שם, תיאור וסיסמה של קבוצה (רק ליוצר)
export const updateGroupInfo = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.creator.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the creator can update the group" });
    }

    const { name, description, password } = req.body;

    if (name) group.name = name;
    if (description) group.description = description;
    if (password !== undefined) group.password = password;

    await group.save();
    res.status(200).json({ message: "Group updated", group });
  } catch (error) {
    console.error("Failed to update group info", error);
    res.status(500).json({ message: "Failed to update group info" });
  }
};
