import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import CreatePost from "../components/CreatePost";
import Comments from "../components/Comments";
import Logo from "../components/Logo";
import { FaHeart, FaEdit, FaTrash, FaComment, FaClock } from "react-icons/fa";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await API.get("/posts/feed");
      setPosts(res.data.posts || res.data);
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Error fetching current user");
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchCurrentUser();
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6 animate-bounce-subtle">
            <Logo size="xl" showText={true} />
          </div>
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-2xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-slide-up">
          <CreatePost onPostCreated={fetchFeed} />

          {posts.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm p-12 shadow-xl rounded-2xl text-center border border-white/20 animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce-subtle">
                  <Logo size="lg" showText={false} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Start following people to see their posts in your feed!</p>
              <Link
                to="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Discover Users
              </Link>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {posts.map((post, index) => (
                <div
                  key={post._id}
                  className="bg-white/80 backdrop-blur-sm p-6 shadow-xl rounded-2xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Link to={`/profile/${post.user._id}`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform">
                        {post.user?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/profile/${post.user._id}`}
                        className="font-bold text-gray-900 hover:text-blue-600 transition block text-lg"
                      >
                        {post.user?.username || "Unknown"}
                      </Link>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <FaClock className="text-xs" />
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {post.content && (
                    <p className="text-gray-800 mb-4 whitespace-pre-wrap text-base leading-relaxed">
                      {post.content}
                    </p>
                  )}

                  {post.photo && (
                    <div className="mb-4 rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={post.photo}
                        alt="Post"
                        className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="flex gap-6 items-center pt-4 border-t border-gray-200">
                    <button
                      onClick={async () => {
                        try {
                          await API.put(`/posts/${post._id}/like`);
                          fetchFeed();
                        } catch (err) {
                          console.error("Error liking post:", err);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-110 ${
                        post.likes?.some(
                          (like) => {
                            const likeId = typeof like === 'object' ? (like._id || like) : like;
                            return likeId?.toString() === currentUser?._id?.toString();
                          }
                        )
                          ? "text-red-600 bg-red-50"
                          : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <FaHeart
                        className={
                          post.likes?.some(
                            (like) => {
                              const likeId = typeof like === 'object' ? (like._id || like) : like;
                              return likeId?.toString() === currentUser?._id?.toString();
                            }
                          )
                            ? "fill-current animate-bounce-subtle"
                            : ""
                        }
                      />
                      <span className="font-medium">{post.likes?.length || 0}</span>
                    </button>

                    <div className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <FaComment />
                      <span className="font-medium">{post.comments?.length || 0}</span>
                    </div>

                    {currentUser && currentUser._id === post.user._id && (
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={async () => {
                            const newContent = prompt("Edit post:", post.content);
                            if (newContent && newContent.trim()) {
                              try {
                                await API.put(`/posts/${post._id}`, { content: newContent });
                                fetchFeed();
                              } catch (err) {
                                console.error("Error updating post:", err);
                                alert("Failed to update post");
                              }
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Edit post"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this post?")) {
                              try {
                                await API.delete(`/posts/${post._id}`);
                                fetchFeed();
                              } catch (err) {
                                console.error("Error deleting post:", err);
                                alert("Failed to delete post");
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                          title="Delete post"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  <Comments postId={post._id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
