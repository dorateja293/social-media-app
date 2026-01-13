import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { FaUserPlus, FaUserMinus, FaHeart, FaComment, FaClock } from "react-icons/fa";
import Comments from "../components/Comments";
import Logo from "../components/Logo";

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
        const userRes = await API.get(`/users/${id}`);
        setUser(userRes.data);
      } else {
        await API.put(`/users/${id}/follow`);
        setIsFollowing(true);
        const userRes = await API.get(`/users/${id}`);
        setUser(userRes.data);
      }
    } catch (err) {
      console.error("Error following/unfollowing:", err);
      alert(err.response?.data?.message || "Failed to follow/unfollow user");
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6 animate-bounce-subtle">
            <Logo size="xl" showText={true} />
          </div>
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center border border-white/20">
          <div className="text-red-500 text-xl font-semibold mb-2">{error || "User not found"}</div>
          <Link to="/" className="text-blue-600 hover:text-purple-600 font-medium">
            Go back to feed
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === id;

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm p-8 shadow-xl rounded-2xl mb-8 border border-white/20 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl transform hover:scale-105 transition-transform">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{user.username}</h2>
              <p className="text-gray-600 mb-6 text-lg">{user.email}</p>
              <div className="flex gap-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {user.followers?.length || 0}
                  </div>
                  <div className="text-gray-600 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {user.following?.length || 0}
                  </div>
                  <div className="text-gray-600 text-sm">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                    {posts.length}
                  </div>
                  <div className="text-gray-600 text-sm">Posts</div>
                </div>
              </div>
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
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

        {/* Posts Section */}
        <h3 className="text-3xl font-bold mb-6 text-gray-900">Posts</h3>
        {posts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm p-12 shadow-xl rounded-2xl text-center border border-white/20 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce-subtle">
                <Logo size="lg" showText={false} />
              </div>
            </div>
            <p className="text-xl text-gray-600">No posts yet</p>
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {post.user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
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
                  <p className="text-gray-800 mb-4 text-base leading-relaxed">{post.content}</p>
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
                <div className="mt-4 flex gap-6 items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={async () => {
                      await API.put(`/posts/${post._id}/like`);
                      const postsRes = await API.get(`/posts/user/${id}`);
                      setPosts(postsRes.data.posts || postsRes.data);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-110 ${
                      post.likes?.some(like => {
                        const likeId = typeof like === 'object' ? (like._id || like) : like;
                        return likeId?.toString() === currentUser?._id?.toString();
                      })
                        ? "text-red-600 bg-red-50"
                        : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <FaHeart
                      className={
                        post.likes?.some(like => {
                          const likeId = typeof like === 'object' ? (like._id || like) : like;
                          return likeId?.toString() === currentUser?._id?.toString();
                        })
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
                </div>
                <Comments postId={post._id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
