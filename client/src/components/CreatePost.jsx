import { useState } from "react";
import API from "../api/axios";
import { FaPaperPlane, FaImage, FaTimes } from "react-icons/fa";

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !photo) return;

    setLoading(true);
    try {
      const fd = new FormData();
      if (content.trim()) fd.append("content", content);
      if (photo) fd.append("photo", photo);

      await API.post("/posts", fd);
      setContent("");
      setPhoto(null);
      setPreview(null);
      onPostCreated();
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white/80 backdrop-blur-sm p-6 shadow-xl rounded-2xl mb-6 border border-white/20 hover:shadow-2xl transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          ✎
        </div>
        <h3 className="text-xl font-bold text-gray-900">Create Post</h3>
      </div>
      
      <textarea
        className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      
      {preview && (
        <div className="mt-4 relative rounded-xl overflow-hidden shadow-lg group">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-80 object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setPhoto(null);
              setPreview(null);
            }}
            className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200">
        <label className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-all px-4 py-2 rounded-lg hover:bg-blue-50">
          <FaImage className="text-xl" />
          <span className="font-medium">Add Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </label>
        <button
          type="submit"
          disabled={loading || (!content.trim() && !photo)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <FaPaperPlane /> {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
