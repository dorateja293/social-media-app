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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6 animate-bounce-subtle">
            <Logo size="xl" showText={true} />
          </div>
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = data.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-2xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <FaBell className="text-xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Mark all as read
            </button>
          )}
        </div>

        {data.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm p-12 shadow-xl rounded-2xl text-center border border-white/20 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce-subtle">
                <FaBell className="text-white text-3xl" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600 text-lg">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {data.map((n, index) => (
              <div
                key={n._id}
                className={`bg-white/80 backdrop-blur-sm p-5 shadow-xl rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                  n.isRead
                    ? "opacity-75 border-gray-200"
                    : "border-blue-300 bg-gradient-to-r from-blue-50/50 to-purple-50/50"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-3 rounded-full ${
                    n.type === "like" 
                      ? "bg-red-100 text-red-600" 
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {n.type === "like" ? (
                      <FaHeart className="text-xl" />
                    ) : (
                      <FaComment className="text-xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-base">
                      <Link
                        to={`/profile/${n.sender?._id}`}
                        className="font-bold text-blue-600 hover:text-purple-600 transition"
                      >
                        {n.sender?.username || "Someone"}
                      </Link>{" "}
                      <span className="text-gray-600">
                        {n.type === "like" ? "liked" : "commented on"} your post
                      </span>
                    </p>
                    {n.post && (
                      <Link
                        to="/"
                        className="text-sm text-blue-600 hover:text-purple-600 mt-2 inline-block font-medium"
                      >
                        View post →
                      </Link>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      {formatTimeAgo(n.createdAt)}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 rounded-lg transition-all"
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
