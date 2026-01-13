import { useEffect, useState } from "react";
import API from "../api/axios";
import { FaComment, FaTrash, FaPaperPlane } from "react-icons/fa";

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await API.get(`/posts/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  useEffect(() => {
    load();
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Error fetching user");
      }
    };
    fetchUser();
  }, [postId]);

  const add = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await API.post(`/posts/${postId}/comment`, { text: text.trim() });
      setText("");
      load();
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await API.delete(`/posts/${postId}/comment/${commentId}`);
      load();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return commentDate.toLocaleDateString();
  };

  return (
    <div className="mt-5 pt-5 border-t border-gray-200">
      <form onSubmit={add} className="mb-4">
        <div className="flex gap-2">
          <input
            className="flex-1 border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 font-medium"
          >
            <FaPaperPlane /> {loading ? "..." : "Post"}
          </button>
        </div>
      </form>

      {comments.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {comments.map((c) => (
            <div
              key={c._id}
              className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 rounded-xl flex items-start justify-between gap-3 hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {c.user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {c.user?.username || "Unknown"}
                  </span>
                </div>
                <p className="text-gray-700 text-sm ml-10 mb-1">{c.text}</p>
                <div className="text-xs text-gray-400 ml-10">
                  {formatTimeAgo(c.createdAt)}
                </div>
              </div>
              {currentUser &&
                (currentUser._id === c.user?._id || currentUser._id === c.user) && (
                  <button
                    onClick={() => deleteComment(c._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                    title="Delete comment"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
