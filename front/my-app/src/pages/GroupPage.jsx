import { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { X, Heart, Trash2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import {
  deletePost as deletePostHelper,
  addComment as addCommentHelper,
  deleteComment as deleteCommentHelper,
  toggleLike as toggleLikeHelper
} from "../lib/postHelpers";

const GroupsPage = () => {
  const { authUser } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupPosts, setGroupPosts] = useState([]);
  const [filter, setFilter] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupPassword, setGroupPassword] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [commentText, setCommentText] = useState({});
  const [filterDate, setFilterDate] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterImageOnly, setFilterImageOnly] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPassword, setEditPassword] = useState("");


  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get("/groups");
      setGroups(res.data);
    } catch {
      toast.error("Failed to load groups");
    }
  };

  const fetchGroupPosts = async (groupId) => {
    try {
      const res = await axiosInstance.get(`/posts/group/${groupId}`);
      setGroupPosts(res.data);
    } catch {
      toast.error("Failed to fetch posts");
    }
  };

  const createGroup = async () => {
    if (!name.trim()) return toast.error("Group name required");
    try {
      setLoading(true);
      await axiosInstance.post("/groups", {
        name,
        description,
        password: groupPassword,
        image: groupImage
      });
      toast.success("Group created");
      setName("");
      setDescription("");
      fetchGroups();
    } catch {
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = async (group) => {
    const creatorId = group.creator?._id || group.creator;
    const isMember = group.members.includes(authUser._id);
    const isCreator = creatorId === authUser._id;

    if (group.password && !isMember && !isCreator) {
      const inputPassword = prompt("This group is protected. Please enter the password:");
      if (inputPassword !== group.password) {
        toast.error("Incorrect password");
        return;
      }
    }
    setEditName(group.name || "");
    setEditDescription(group.description || "");
    setEditPassword(group.password || "");
    setSelectedGroup(group);
  };

  const createPost = async () => {
    if (!text.trim() || !selectedGroup) return;
    try {
      const res = await axiosInstance.post("/posts", {
        text,
        image,
        groupId: selectedGroup._id
      });
      setGroupPosts([res.data, ...groupPosts]);
      setText("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Post created");
    } catch {
      toast.error("Failed to post");
    }
  };

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm("האם אתה בטוח שאתה רוצה למחוק את הקבוצה?");
    if (!confirmed) return;
    try {
      await axiosInstance.delete(`/groups/${selectedGroup._id}`);
      toast.success("Group deleted");
      setGroups((prev) => prev.filter((g) => g._id !== selectedGroup._id));
      setSelectedGroup(null);
    } catch {
      toast.error("Failed to delete group");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) fetchGroupPosts(selectedGroup._id);
  }, [selectedGroup]);

  const isGroupCreator = (group) => {
    return (group.creator?._id || group.creator) === authUser._id;
  };

  return (
    <div className="h-screen bg-base-200 relative">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <aside className="w-64 bg-base-300 p-4 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-3">Groups</h2>
              <input type="text" placeholder="Search groups..." className="input input-bordered input-sm w-full mb-3" value={filter} onChange={(e) => setFilter(e.target.value)} />
              <input type="text" className="input input-bordered input-xs w-full mb-1" placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} />
                            <input type="file" accept="image/*" className="mb-1" onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onloadend = () => setGroupImage(reader.result);
                reader.readAsDataURL(file);
              }} />
              {groupImage && (
                <div className="mb-2">
                  <img src={groupImage} alt="Group preview" className="w-20 h-20 object-cover rounded border mx-auto" />
                </div>
              )}
              <textarea className="textarea textarea-bordered textarea-xs w-full mb-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        <input
                          type="password"
                          className="input input-bordered input-sm w-full mb-2"
                          placeholder="Group password (leave empty for public)"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                        />
    
              <button className="btn btn-sm btn-success w-full mb-3" onClick={createGroup} disabled={loading}>➕ Create Group</button>
              {groups
                .filter(g => g.name.toLowerCase().includes(filter.toLowerCase()))
                .map((group) => (
                  <div key={group._id} onClick={() => handleGroupSelect(group)} className={`p-2 mb-2 rounded cursor-pointer flex items-center gap-2 ${selectedGroup?._id === group._id ? "bg-primary text-white" : "bg-base-100"}`}>
                    {group.image && <img src={group.image} alt="group" className="w-10 h-10 object-cover rounded border" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate flex items-center gap-1">
                        {group.name}
                        {isGroupCreator(group) && <span className="text-xs text-green-500">(You)</span>}
                        {group.password && <Lock size={14} className="text-red-500" title="Private group" />}
                      </h4>
                      <p className="text-xs text-zinc-500 truncate">{group.description}</p>
                    </div>
                  </div>
                ))}
            </aside>

            <main className="flex-1 p-6 overflow-y-auto">
              {!selectedGroup ? (
                <div className="text-center text-zinc-400">Select or create a group to view posts.</div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">{selectedGroup.name} – Posts</h2>


<p className="text-xs text-zinc-500 mb-4">
  {selectedGroup.password ? "🔒 Private group" : "🌐 Public group"}
</p>

<p className="text-sm text-zinc-600 mb-4">
  {selectedGroup.description || "No description available."}
</p>

                  {isGroupCreator(selectedGroup) && (
                    <>
                      <button onClick={handleDeleteGroup} className="btn btn-error btn-sm mb-4">🗑️ Delete Group</button>
                      <div className="mb-4">
                        <label className="block mb-1 font-medium">Update Group Image</label>
                        <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              try {
                                const res = await axiosInstance.put(`/groups/${selectedGroup._id}/image`, {
                                  image: reader.result,
                                });
                                toast.success("Image updated");
                                setSelectedGroup({ ...selectedGroup, image: res.data.image });
                              } catch {
                                toast.error("Failed to update image");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>

                      <div className="mb-4">
                        <label className="block mb-1 font-medium">Edit Group Info</label>
                        <input
                          type="text"
                          className="input input-bordered input-sm w-full mb-2"
                          placeholder="Group name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <textarea
                          className="textarea textarea-bordered textarea-sm w-full mb-2"
                          placeholder="Description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <input
                          type="password"
                          className="input input-bordered input-sm w-full mb-2"
                          placeholder="Group password (leave empty for public)"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                        />
    
                        <button
                          className="btn btn-sm btn-info"
                          onClick={async () => {
                            try {
                              const res = await axiosInstance.put(`/groups/${selectedGroup._id}`, {
                                name: editName,
                                description: editDescription,
            password: editPassword
                              });
                              toast.success("Group updated");
                              setSelectedGroup(res.data.group);
                              fetchGroups();
                            } catch {
                              toast.error("Failed to update group");
                            }
                          }}
                        >
                          💾 Save Changes
                        </button>
                      </div>

                    </>
                  )}

                  
                  <div className="flex flex-wrap gap-4 mb-4 items-center">
                    <input
                      type="date"
                      className="input input-bordered input-sm"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Search by author"
                      className="input input-bordered input-sm"
                      value={filterAuthor}
                      onChange={(e) => setFilterAuthor(e.target.value)}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filterImageOnly}
                        onChange={(e) => setFilterImageOnly(e.target.checked)}
                        className="checkbox checkbox-sm"
                      />
                      <span>With image only</span>
                    </label>
                  </div>

<div className="mb-6">
                    <textarea className="textarea textarea-bordered w-full mb-2" placeholder="What's on your mind?" value={text} onChange={(e) => setText(e.target.value)} />
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="mb-2" />
                    <button className="btn btn-primary btn-sm" onClick={createPost}>Post</button>
                  </div>

                  {groupPosts.length === 0 ? (
                    <div className="text-zinc-400">No posts in this group yet.</div>
                  ) : (
                    groupPosts
                    .filter((post) => {
                      const postDate = new Date(post.createdAt).toISOString().split("T")[0];
                      const matchesDate = filterDate ? postDate === filterDate : true;
                      const matchesAuthor = filterAuthor
                        ? post.userId?.fullName?.toLowerCase().includes(filterAuthor.toLowerCase())
                        : true;
                      const matchesImage = filterImageOnly ? !!post.image : true;
                      return matchesDate && matchesAuthor && matchesImage;
                    })
                    .map((post) => (
                      <div key={post._id} className="border rounded-lg p-4 bg-base-100 shadow mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <img src={post.userId?.profilePic || "/avatar.jpg"} className="w-8 h-8 rounded-full" alt="profile" />
                          <h3 className="font-semibold text-sm">{post.userId?.fullName || "Unknown User"}</h3>
                          <span className="text-xs text-zinc-400 ml-auto">{new Date(post.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="mb-2">{post.text}</p>
                        {post.image && <img src={post.image} alt="post" className="rounded max-w-xs border mb-2" />}
                        {(selectedGroup.creator === authUser._id || post.userId?._id === authUser._id) && (
  <button onClick={() => deletePostHelper(post._id, setGroupPosts, toast, axiosInstance)} className="text-red-500 text-sm flex items-center gap-1 mb-2">
                            <Trash2 size={14} /> Delete Post
                          </button>
                        )}
                        <div className="flex items-center gap-4 mb-2">
                          <button onClick={() => toggleLikeHelper(post._id, authUser._id, setGroupPosts, toast, axiosInstance)} className="flex items-center gap-1">
                            <Heart size={18} className={post.likes.includes(authUser._id) ? "text-red-500" : ""} />
                            <span>{post.likes.length}</span>
                          </button>
                        </div>
                        <div className="mt-2">
                          {post.comments.map((comment) => {
                            const isCommentAuthor = comment.userId?._id === authUser._id;
    const isGroupCreator = selectedGroup?.creator === authUser._id;
    const isPostOwner = post.userId?._id === authUser._id;
    const canDelete = isCommentAuthor || isGroupCreator || isPostOwner || selectedGroup.creator === authUser._id;
                            return (
                              <div key={comment._id} className="flex items-start gap-2 mb-1">
                                <img src={comment.userId?.profilePic || "/avatar.jpg"} className="w-6 h-6 rounded-full" alt="" />
                                <div>
                                  <p className="text-sm font-semibold">{comment.userId?.fullName}</p>
                                  <p className="text-sm">{comment.text}</p>
                                  {canDelete && (
                                    <button onClick={() => deleteCommentHelper(post._id, comment._id, setGroupPosts, toast, axiosInstance)} className="text-xs text-red-500 ml-2">
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex gap-2 mt-2">
                            <input type="text" className="input input-bordered input-sm flex-1" placeholder="Write a comment..." value={commentText[post._id] || ""} onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))} />
                            <button className="btn btn-sm btn-primary" onClick={() => addCommentHelper(post._id, commentText[post._id], setGroupPosts, setCommentText, toast, axiosInstance)}>Send</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
