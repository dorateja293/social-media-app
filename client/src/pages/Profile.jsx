import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { FaUserPlus, FaUserMinus, FaHeart, FaComment, FaClock } from "react-icons/fa";
import Comments from "../components/Comments";
import Logo from "../components/Logo";
import CreatePost from "../components/CreatePost";

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await API.get(`/users/${id}`);
        setUser(userRes.data);

        const currentUserRes = await API.get("/auth/me");
        setCurrentUser(currentUserRes.data);

        const followingIds = currentUserRes.data.following.map(f => {
          const followId = typeof f === 'object' ? (f._id || f) : f;
          return followId?.toString();
        });
        setIsFollowing(followingIds.includes(id));

        const postsRes = await API.get(`/posts/user/${id}`);
        setPosts(postsRes.data.posts || postsRes.data);
      } catch (err) {
        setError("User not found");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await API.put(`/users/${id}/unfollow`);
        setIsFollowing(false);
        // Optimistically update UI
        setUser(prev => ({
          ...prev,
          followers: prev.followers.filter(f => {
            const fId = typeof f === 'object' ? f._id : f;
            return fId !== currentUser._id;
          })
        }));
      } else {
        await API.put(`/users/${id}/follow`);
        setIsFollowing(true);
        // Optimistically update UI
        setUser(prev => ({
          ...prev,
          followers: [...prev.followers, currentUser._id]
        }));
      }
    } catch (err) {
      console.error("Error following/unfollowing:", err);
      alert(err.response?.data?.message || "Failed to follow/unfollow user");
      // Revert on error
      setIsFollowing(!isFollowing);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-2 animate-bounce-subtle">
            <Logo size="md" showText={true} />
          </div>
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
          <p className="mt-3 text-gray-500 text-xs font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-100">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl text-center border border-gray-800">
          <div className="text-red-400 text-xl font-semibold mb-2">{error || "User not found"}</div>
          <Link to="/" className="text-gray-300 hover:text-white font-medium">
            Go back to feed
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === id;

  return (
    <div className="min-h-screen pb-12 bg-black text-gray-100">
      <div className="max-w-5xl mx-auto pt-6 px-3 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
        {/* Profile Header - flat on dark background */}
        <div className="px-1 sm:px-0 max-w-[480px] w-full animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center text-gray-100 text-4xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-100 mb-1">{user.username}</h2>
              <p className="text-gray-400 mb-4 text-sm">{user.email}</p>
              <div className="flex gap-8 mb-3 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-100">
                    {user.followers?.length || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-100">
                    {user.following?.length || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-100">
                    {posts.length}
                  </div>
                  <div className="text-gray-400 text-sm">Posts</div>
                </div>
              </div>
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 ${
                    isFollowing
                      ? "bg-gray-800 text-gray-100 hover:bg-gray-700"
                      : "bg-gray-100 text-black hover:bg-white"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <FaUserMinus /> Unfollow
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Create Post (only on profile page) */}
        <div className="w-full max-w-[480px]">
          <CreatePost onPostCreated={async () => {
            const postsRes = await API.get(`/posts/user/${id}`);
            setPosts(postsRes.data.posts || postsRes.data);
          }} />
        </div>

        {/* Posts Section - same style as feed */}
        <h3 className="text-2xl font-semibold mb-4 text-gray-100 text-center w-full">Your Posts</h3>
        {posts.length === 0 ? (
          <div className="bg-gray-900 px-6 py-6 shadow-xl rounded-2xl text-center border border-gray-800 animate-fade-in max-w-[480px] mx-auto">
            <p className="text-base text-gray-300">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {posts.map((post) => (
              <article
                key={post._id}
                className="rounded-2xl border border-gray-900 bg-black overflow-hidden max-w-[480px] mx-auto"
              >
                {/* Header like feed */}
                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-100">
                      {post.user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {post.user?.username || "Unknown"}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Caption above media */}
                {post.content && (
                  <div className="px-3 pt-2 pb-2">
                    <p className="text-sm text-gray-100 whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}

                {/* Media box - square like feed */}
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

                {/* Actions row (like + comment) */}
                <div className="px-3 pt-3 flex items-center justify-between text-xl text-gray-200">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={async () => {
                        await API.put(`/posts/${post._id}/like`);
                        const postsRes = await API.get(`/posts/user/${id}`);
                        setPosts(postsRes.data.posts || postsRes.data);
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

                {/* Comments thread */}
                <div className="px-3 pb-4">
                  <Comments postId={post._id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
