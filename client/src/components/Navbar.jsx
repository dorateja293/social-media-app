import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Search from "./Search";
import Logo from "./Logo";
import { FaHome, FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await API.get("/auth/me");
          setCurrentUser(res.data);
        }
      } catch (err) {
        console.error("Error fetching user");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/login");
  };

  const token = localStorage.getItem("token");

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo size="md" showText={true} />

          {token && (
            <div className="flex-1 max-w-md mx-4">
              <Search />
            </div>
          )}

          <div className="flex items-center gap-3">
            {token ? (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-all px-3 py-2 rounded-lg hover:bg-blue-50"
                  title="Home"
                >
                  <FaHome />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-all px-3 py-2 rounded-lg hover:bg-blue-50 relative"
                  title="Notifications"
                >
                  <FaBell />
                  <span className="hidden sm:inline">Notifications</span>
                </Link>
                {currentUser && (
                  <Link
                    to={`/profile/${currentUser._id}`}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-all px-3 py-2 rounded-lg hover:bg-blue-50"
                    title="Profile"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{currentUser.username}</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                  title="Logout"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
