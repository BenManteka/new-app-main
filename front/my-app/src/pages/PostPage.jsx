import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import { X, Heart, Share2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const PostPage = () => {
  const { authUser } = useAuthStore();
  const {
    selectedUser,
    setSelectedUser,
    sharedWithUser,
    setSharedWithUser,
  } = useChatStore();

  const [isChatFull, setIsChatFull] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [chatPosition, setChatPosition] = useState({ top: 100, left: window.innerWidth - 420 });

  const toggleChatSize = () => setIsChatFull(prev => !prev);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setChatPosition({
        top: e.clientY - dragOffset.y,
        left: e.clientX - dragOffset.x,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likesList, setLikesList] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterImageOnly, setFilterImageOnly] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const fileInputRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imagePreview) return;
    try {
      const res = await axiosInstance.post("/posts", { text, image: imagePreview });
      setPosts([res.data, ...posts]);
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error("Failed to post");
    }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, likes: res.data.likes } : post
        )
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const fetchLikes = async (postId) => {
    try {
      const res = await axiosInstance.get(`/posts/${postId}/likes`);
      setLikesList(res.data);
      setShowLikesModal(true);
    } catch (err) {
      toast.error("Failed to fetch likes");
    }
  };

  const sharePostToChat = async (post) => {
    const targetUser = selectedUser || sharedWithUser;
    if (!targetUser) {
      toast.error("No user selected to share with");
      return;
    }
    try {
      await axiosInstance.post(`/messages/send/${targetUser._id}`, {
        text: `📢 Shared Post:\n\nFrom: ${post.userId?.fullName || "Unknown"}\nAt: ${new Date(post.createdAt).toLocaleString()}\n\n${post.text || ""}\n${post.image || ""}`,
      });
      toast.success("Post shared!");
    } catch (err) {
      toast.error("Share failed");
    }
  };

  const addComment = async (postId, commentText, clearInput) => {
    if (!commentText.trim()) return;
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comments`, { text: commentText });
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, comments: res.data } : post))
      );
      clearInput();
    } catch (err) {
      toast.error("Comment failed");
    }
  };

  const deletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? {
            ...post,
            comments: post.comments.filter((c) => c._id !== commentId),
          } : post
        )
      );
      toast.success("Comment deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="h-screen bg-base-200 relative">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Posts Feed</h2>
              
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
                {imagePreview && (
                  <div className="relative inline-block mb-3">
                    <img src={imagePreview} alt="preview" className="w-40 h-40 rounded object-cover border" />
                    <button
                      className="absolute top-1 right-1 bg-base-300 rounded-full p-1"
                      onClick={() => {
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <textarea
                  className="w-full p-3 border rounded-lg mb-2"
                  placeholder="What's on your mind?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex gap-2">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                  <button className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()}>Upload Image</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Post</button>
                </div>
              </div>

              {posts
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
                  {post.userId._id === authUser._id && (
                    <button onClick={() => deletePost(post._id)} className="text-red-500 text-sm flex items-center gap-1 mb-2">
                      <Trash2 size={14} /> Delete Post
                    </button>
                  )}
                  <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => toggleLike(post._id)} className="flex items-center gap-1">
                      <Heart size={18} className={post.likes.includes(authUser._id) ? "text-red-500" : ""} />
                      <span>{post.likes.length}</span>
                    </button>
                    <button onClick={() => fetchLikes(post._id)} className="text-sm underline text-zinc-500">
                      View Likes
                    </button>
                    <button onClick={() => sharePostToChat(post)} className="btn btn-xs btn-outline ml-auto">
                      <Share2 size={14} className="mr-1" /> Share to Chat
                    </button>
                  </div>
                  <div className="mt-2">
                    {post.comments.map((comment) => {
                      const canDelete = comment.userId?._id === authUser._id || post.userId._id === authUser._id;
                      return (
                        <div key={comment._id} className="flex items-start gap-2 mb-1">
                          <img src={comment.userId?.profilePic || "/avatar.jpg"} className="w-6 h-6 rounded-full" alt="" />
                          <div>
                            <p className="text-sm font-semibold">{comment.userId?.fullName}</p>
                            <p className="text-sm">{comment.text}</p>
                            {canDelete && (
                              <button onClick={() => deleteComment(post._id, comment._id)} className="text-xs text-red-500 ml-2">
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <CommentInput postId={post._id} onSubmit={addComment} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showLikesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Liked by</h3>
            <ul>
              {likesList.map((user) => (
                <li key={user._id} className="mb-1">{user.fullName}</li>
              ))}
            </ul>
            <button className="btn btn-sm mt-2" onClick={() => setShowLikesModal(false)}>Close</button>
          </div>
        </div>
      )}

      {selectedUser && (
        <div
          className={isChatFull ? "fixed inset-0 z-50 bg-base-100" : "fixed w-[400px] max-h-[80vh] bg-base-100 overflow-y-auto"}
          style={isChatFull ? {} : { top: chatPosition.top, left: chatPosition.left }}
          onMouseDown={isChatFull ? undefined : (e) => {
            setIsDragging(true);
            setDragOffset({
              x: e.clientX - chatPosition.left,
              y: e.clientY - chatPosition.top,
            });
          }}
        >
          <div className="flex justify-between items-center bg-base-200 px-4 py-2 border-b">
            <span className="font-semibold">Chat</span>
            <button onClick={toggleChatSize} className="btn btn-xs btn-outline">
              {isChatFull ? "Minimize" : "Maximize"}
            </button>
          </div>
          <div style={{ height: "calc(100% - 2.5rem)", overflowY: "auto" }}>
            <div className="p-2">
              <ChatContainer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CommentInput = ({ postId, onSubmit }) => {
  const [text, setText] = useState("");
  const handleSend = () => onSubmit(postId, text, () => setText(""));
  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        className="input input-bordered input-sm flex-1"
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-sm btn-primary" onClick={handleSend}>Send</button>
    </div>
  );
};

export default PostPage;