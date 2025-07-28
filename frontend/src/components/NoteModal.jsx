import React, { useEffect, useState } from "react";
import axios from "axios";

const NoteModal = ({ isOpen, onClose, note, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(note ? note.title : "");
    setDescription(note ? note.description : "");
    setIsPinned(note ? note.isPinned : false);
    setTags(note?.tags || []);
    setError("");
  }, [note]);

  const handleTagAdd = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in");
        return;
      }

      const payload = {
        title,
        description,
        isPinned,
        isPublic: false,
        tags,
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = note
        ? await axios.put(`/api/notes/${note._id}`, payload, config)
        : await axios.post("/api/notes", payload, config);

      onSave(data);
      setTitle("");
      setDescription("");
      setIsPinned(false);
      setTags([]);
      setTagInput("");
      setError("");
      onClose();
    } catch (err) {
      console.log("Note save error", err);
      setError("Failed to save note");
    }
  };

  const handleShare = async () => {
    const email = prompt("Enter email address to share this note:");
    if (!email) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const { data } = await axios.post(
        `/api/notes/${note._id}/share`,
        { email },
        config
      );

      alert(`Note shared with ${email}`);
    } catch (err) {
      console.error("Share failed", err);
      alert("Failed to share the note.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {note ? "Edit Note" : "Create Note"}
        </h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Note Description"
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />

          {/* Tags */}
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                className="w-full px-3 py-1 bg-gray-700 text-white border border-gray-600 rounded-md"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center"
                >
                  #{tag}
                  <button
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-white hover:text-red-400"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-white">
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={() => setIsPinned(!isPinned)}
              />
              <span>📌 Pin Note</span>
            </label>

            <button
              type="button"
              onClick={handleShare}
              className="text-blue-400 hover:text-blue-600 flex items-center space-x-1"
            >
              🌐 <span>Share Publicly</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {note ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
