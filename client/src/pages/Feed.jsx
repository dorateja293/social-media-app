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
      console.error("Error fetching current user", err);
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

    return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 pb-12">
      <div className="max-w-5xl mx-auto pt-4 px-2 sm:px-4">

        {/* Create post composer removed from home feed */}

        {/* Loading state over post list */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-2">
              <Logo size="sm" showText={true} />
              <div className="w-5 h-5 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
              <p className="text-[11px] text-gray-500">Loading your feed...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-950 p-8 text-center">
            <p className="text-base text-gray-200 mb-1">No posts yet</p>
            <p className="text-xs text-gray-500">
              Be the first to share something.
            </p>
          </div>
        ) : (
          <main className="space-y-6 mt-2">
            {posts.map((post) => (
              <article
                key={post._id}
                className="rounded-2xl border border-gray-900 bg-black overflow-hidden max-w-[480px] mx-auto"
              >
                {/* Header like Instagram */}
                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.user._id}`}>
                      <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-100">
                        {post.user?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </Link>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {post.user?.username || "Unknown"}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-500 text-xl leading-none">⋯</button>
                </div>

                {/* Caption above media (no username prefix) */}
                {post.content && (
                  <div className="px-3 pt-2 pb-2">
                    <p className="text-sm text-gray-100 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Media box - square like IG */}
                {post.photo && (
                  <div className="bg-black flex justify-center">
                    <div className="w-full aspect-square max-w-[480px] flex items-center justify-center bg-black">
                      <img
                        src={post.photo}
                        alt="Post"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Actions row icons (like + comment) */}
                <div className="px-3 pt-3 flex items-center justify-between text-xl text-gray-200">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={async () => {
                        try {
                          await API.put(`/posts/${post._id}/like`);
                          fetchFeed();
                        } catch (err) {
                          console.error("Error liking post:", err);
                        }
                      }}
                      className={
                        post.likes?.some((like) => {
                          const likeId =
                            typeof like === "object" ? like._id || like : like;
                          return (
                            likeId?.toString() === currentUser?._id?.toString()
                          );
                        })
                          ? "text-red-400"
                          : "text-gray-200 hover:text-red-400"
                      }
                    >
                      <FaHeart
                        className={
                          post.likes?.some((like) => {
                            const likeId =
                              typeof like === "object" ? like._id || like : like;
                            return (
                              likeId?.toString() === currentUser?._id?.toString()
                            );
                          })
                            ? "fill-current"
                            : ""
                        }
                      />
                    </button>
                    <button className="text-gray-200 hover:text-gray-100">
                      <FaComment />
                    </button>
                  </div>

                  {currentUser && currentUser._id === post.user._id && (
                    <div className="flex gap-3 text-base">
                      <button
                        onClick={async () => {
                          const newContent = prompt("Edit post:", post.content);
                          if (newContent && newContent.trim()) {
                            try {
                              await API.put(`/posts/${post._id}`, {
                                content: newContent,
                              });
                              fetchFeed();
                            } catch (err) {
                              console.error("Error updating post:", err);
                              alert("Failed to update post");
                            }
                          }
                        }}
                        className="text-gray-400 hover:text-gray-200"
                        title="Edit post"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this post?"
                            )
                          ) {
                            try {
                              await API.delete(`/posts/${post._id}`);
                              fetchFeed();
                            } catch (err) {
                              console.error("Error deleting post:", err);
                              alert("Failed to delete post");
                            }
                          }
                        }}
                        className="text-gray-400 hover:text-red-400"
                        title="Delete post"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>

                {/* Likes + meta */}
                <div className="px-3 pt-2 pb-3 text-sm">
                  <p className="font-semibold text-gray-100">
                    {(post.likes?.length || 0).toLocaleString()} likes
                  </p>

                  <button className="mt-1 text-[13px] text-gray-500">
                    View all {post.comments?.length || 0} comments
                  </button>
                </div>

                {/* Full comments thread (existing component) */}
                <div className="px-3 pb-4">
                  <Comments postId={post._id} />
                </div>
              </article>
            ))}
          </main>
        )}
      </div>
    </div>
  );
};
export default Feed;