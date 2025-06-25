import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  password: { type: String },
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);
export default Group;
