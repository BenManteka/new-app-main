
export const deletePost = async (postId, setPosts, toast, axiosInstance) => {
  try {
    await axiosInstance.delete(`/posts/${postId}`);
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    toast.success("Post deleted");
  } catch {
    toast.error("Failed to delete post");
  }
};

export const addComment = async (postId, text, setPosts, setCommentText, toast, axiosInstance) => {
  if (!text?.trim()) return;
  try {
    const res = await axiosInstance.post(`/posts/${postId}/comments`, { text });
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, comments: res.data } : p))
    );
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
  } catch {
    toast.error("Failed to add comment");
  }
};

export const deleteComment = async (postId, commentId, setPosts, toast, axiosInstance) => {
  try {
    await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? { ...post, comments: post.comments.filter((c) => c._id !== commentId) }
          : post
      )
    );
    toast.success("Comment deleted");
  } catch {
    toast.error("Failed to delete comment");
  }
};

export const toggleLike = async (postId, userId, setPosts, toast, axiosInstance) => {
  try {
    const res = await axiosInstance.post(`/posts/${postId}/like`);
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId ? { ...post, likes: res.data.likes } : post
      )
    );
  } catch {
    toast.error("Failed to like/unlike post");
  }
};