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
        console.error("Error fetching user", err);
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
    <div className="mt-4 pt-4 border-t border-gray-900">
      <form onSubmit={add} className="mb-2">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-gray-900 border border-gray-800 p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all text-gray-100 placeholder:text-gray-500 text-sm"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-black text-xs font-semibold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FaPaperPlane className="text-xs" /> {loading ? "Posting" : "Post"}
          </button>
        </div>
      </form>

      {comments.length > 0 && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div
              key={c._id}
              className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-[11px] font-semibold text-gray-100">
                    {c.user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="font-semibold text-gray-100 text-xs">
                    {c.user?.username || "Unknown"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {formatTimeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="text-gray-200 text-sm ml-9 break-words">{c.text}</p>
              </div>
              {currentUser && (() => {
                const commentUserId = typeof c.user === 'object' ? c.user?._id : c.user;
                return commentUserId?.toString() === currentUser._id?.toString();
              })() && (
                <button
                  onClick={() => deleteComment(c._id)}
                  className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg transition-all"
                  title="Delete comment"
                >
                  <FaTrash className="text-xs" />
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
