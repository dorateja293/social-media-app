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
      className="bg-gray-900 px-4 py-3 rounded-2xl mb-4 border border-gray-800 shadow-lg max-w-[480px] mx-auto"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-100 font-bold">
          ✎
        </div>
        <h3 className="text-xl font-bold text-gray-100">Create Post</h3>
      </div>
      
      <textarea
        className="w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none transition-all text-gray-100 placeholder:text-gray-500 text-sm"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
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
      
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-800">
        <label className="flex items-center gap-2 text-gray-300 hover:text-gray-100 cursor-pointer transition-all px-4 py-2 rounded-lg hover:bg-gray-800">
          <FaImage className="text-xl" />
          <span className="font-medium text-sm">Add Photo</span>
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
          className="bg-gray-100 text-black px-6 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <FaPaperPlane /> {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
