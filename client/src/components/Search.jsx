import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 0) {
      try {
        const res = await API.get(`/users/search?q=${encodeURIComponent(value)}`);
        setResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setQuery("");
    setShowResults(false);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        resultsRef.current &&
        !searchRef.current.contains(event.target) &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={searchRef}>
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleSearch}
        onFocus={() => query && setShowResults(true)}
        className="w-full px-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-gray-950 border border-gray-800 rounded-xl shadow-lg max-h-64 overflow-y-auto z-50"
        >
          {results.map((user) => (
            <div
              key={user._id}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleUserClick(user._id);
              }}
              className="px-4 py-3 hover:bg-gray-900 cursor-pointer transition"
            >
              <div className="font-medium text-gray-100">{user.username}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          ))}
        </div>
      )}
      {showResults && query && results.length === 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-gray-950 border border-gray-800 rounded-xl shadow-lg p-4 z-50"
        >
          <div className="text-gray-500 text-center">No users found</div>
        </div>
      )}
    </div>
  );
};

export default Search;
