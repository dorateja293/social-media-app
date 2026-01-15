import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import Search from "./Search";
import Logo from "./Logo";
import {
  FaHome,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const MotionDiv = motion.div;

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
 
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (token) {
          const res = await API.get("/auth/me");
          setCurrentUser(res.data);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Error fetching user", err);
      }
    };
    fetchUser();
  }, [token]);
 
  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsMenuOpen(false);
    navigate("/login");
  };
 

  return (
    <nav className="bg-gray-950/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo size="md" showText={true} />

          {token && (
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <Search />
            </div>
          )}

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-2 text-gray-200 hover:text-white font-medium transition-all px-3 py-2 rounded-lg hover:bg-gray-800"
                  title="Home"
                >
                  <FaHome />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center gap-2 text-gray-200 hover:text-white font-medium transition-all px-3 py-2 rounded-lg hover:bg-gray-800"
                  title="Notifications"
                >
                  <FaBell />
                  <span className="hidden sm:inline">Notifications</span>
                </Link>
                {currentUser && (
                  <Link
                    to={`/profile/${currentUser._id}`}
                    className="flex items-center gap-2 text-gray-200 hover:text-white font-medium transition-all px-3 py-2 rounded-lg hover:bg-gray-800"
                    title="Profile"
                  >
                    <FaUser />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-all"
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
                  className="text-gray-200 hover:text-white font-medium transition-all px-3 py-2 rounded-lg hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-100 text-black px-3 py-2 rounded-lg hover:bg-white transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile actions - simplified */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 text-gray-200 hover:bg-gray-800 transition-all"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              {token && (
                <div className="w-full">
                  <Search />
                </div>
              )}

              <div className="flex flex-col gap-2">
                {token ? (
                  <>
                    <Link
                      to="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
                    >
                      <FaHome />
                      <span>Home</span>
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
                    >
                      <FaBell />
                      <span>Notifications</span>
                    </Link>
                    {currentUser && (
                      <Link
                        to={`/profile/${currentUser._id}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800"
                      >
                        <FaUser />
                        <span>Profile</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800 font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-black font-medium hover:bg-white"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
