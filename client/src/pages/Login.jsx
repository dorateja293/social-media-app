import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Logo from "../components/Logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black text-gray-100">
      <div className="w-full max-w-4xl">
        <div className="bg-gray-950 rounded-3xl shadow-xl border border-gray-800 animate-slide-up flex flex-col md:flex-row overflow-hidden">
          {/* Left: form */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
            <div className="flex justify-center mb-6">
              <Logo size="lg" showText={true} />
            </div>

            <h2 className="text-3xl font-semibold mb-2 text-center text-gray-100">
              Welcome back
            </h2>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Sign in to see what your friends are sharing this stormy morning.
            </p>

            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-100 placeholder:text-gray-500 text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-100 placeholder:text-gray-500 text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-white text-black py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-gray-100 hover:text-white font-semibold transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>

          {/* Right: illustration */}
          <div className="hidden md:block md:w-1/2 bg-gray-900 border-l border-gray-800">
            <img
              src="public/photo.avif"
              alt="Social media feed illustration"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
