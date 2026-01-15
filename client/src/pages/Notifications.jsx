import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { FaHeart, FaComment, FaCheck, FaBell } from "react-icons/fa";
import Logo from "../components/Logo";

const Notifications = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await API.get("/notifications");
      setData(res.data.notifications || res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      load();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notifDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-2 animate-bounce-subtle">
            <Logo size="md" showText={true} />
          </div>
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
          <p className="mt-3 text-gray-500 text-xs font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = data.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen pb-12 bg-black text-gray-100">
      <div className="max-w-2xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-100 bg-gray-900">
              <FaBell className="text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-100">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {data.length > 0 && unreadCount > 0 && (
            <button
              onClick={async () => {
                try {
                  await API.put("/notifications/read-all");
                  load();
                } catch (err) {
                  console.error("Error marking all as read:", err);
                }
              }}
              className="bg-gray-100 hover:bg-white text-black px-4 py-2 rounded-xl text-xs font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {data.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-100 mb-1">All caught up</h3>
            <p className="text-gray-400 text-xs">You don't have any new notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {data.map((n, index) => (
              <div
                key={n._id}
                className={`bg-gray-900 p-4 shadow-md rounded-xl border border-gray-800 transition-all duration-300 ${
                  n.isRead ? "opacity-70" : ""}
              `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-3 rounded-full ${
                    n.type === "like" 
                      ? "bg-gray-800 text-red-400" 
                      : "bg-gray-800 text-gray-200"
                  }`}>
                    {n.type === "like" ? (
                      <FaHeart className="text-xl" />
                    ) : (
                      <FaComment className="text-xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-100 text-base">
                      <Link
                        to={`/profile/${n.sender?._id}`}
                        className="font-bold text-gray-100 hover:text-white transition"
                      >
                        {n.sender?.username || "Someone"}
                      </Link>{" "}
                      <span className="text-gray-400">
                        {n.type === "like" ? "liked" : "commented on"} your post
                      </span>
                    </p>
                    {n.post && (
                      <Link
                        to="/"
                        className="text-sm text-gray-300 hover:text-white mt-2 inline-block font-medium"
                      >
                        View post →
                      </Link>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {formatTimeAgo(n.createdAt)}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-gray-300 hover:text-white p-2 rounded-lg transition-all"
                      title="Mark as read"
                    >
                      <FaCheck />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
