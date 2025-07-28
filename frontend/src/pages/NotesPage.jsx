import React, { useEffect, useState } from "react";
import axios from "axios";
import NoteModal from "../components/NoteModal";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTags, setNewTags] = useState({});

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort pinned notes first
      setNotes(data.sort((a, b) => (b.isPinned === a.isPinned ? 0 : b.isPinned ? 1 : -1)));
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleNoteUpdate = async (id, updates) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(`/api/notes/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update and sort
      setNotes((prev) => {
        const updated = prev.map((note) => (note._id === id ? data : note));
        return [...updated].sort((a, b) => (b.isPinned === a.isPinned ? 0 : b.isPinned ? 1 : -1));
      });
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleAddTag = (note) => {
    const tag = (newTags[note._id] || "").trim();
    if (tag) {
      const updatedTags = [...(note.tags || []), tag];
      handleNoteUpdate(note._id, { tags: updatedTags });
      setNewTags((prev) => ({ ...prev, [note._id]: "" }));
    }
  };

  const handleRemoveTag = (note, tagToRemove) => {
    const updatedTags = note.tags.filter((t) => t !== tagToRemove);
    handleNoteUpdate(note._id, { tags: updatedTags });
  };

  const handlePinToggle = (note) => {
    handleNoteUpdate(note._id, { isPinned: !note.isPinned });
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const otherNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <button
          onClick={() => {
            setSelectedNote(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Note
        </button>
      </div>

      {pinnedNotes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">📌 Pinned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <div
                key={note._id}
                className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{note.title}</h3>
                  <button onClick={() => handlePinToggle(note)}>📌</button>
                </div>
                <p className="mt-2 text-sm text-gray-300">{note.description}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {note.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-blue-600 text-xs px-2 py-1 rounded-full flex items-center"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(note, tag)}
                        className="ml-1 text-white hover:text-red-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Add tag"
                    value={newTags[note._id] || ""}
                    onChange={(e) =>
                      setNewTags({ ...newTags, [note._id]: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddTag(note)
                    }
                  />
                  <button
                    onClick={() => handleAddTag(note)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                <div className="flex justify-end gap-2 mt-4 text-sm">
                  <button
                    onClick={() => {
                      setSelectedNote(note);
                      setModalOpen(true);
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">📝 All Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherNotes.map((note) => (
            <div
              key={note._id}
              className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <button onClick={() => handlePinToggle(note)}>📍</button>
              </div>
              <p className="mt-2 text-sm text-gray-300">{note.description}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {note.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-blue-600 text-xs px-2 py-1 rounded-full flex items-center"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(note, tag)}
                      className="ml-1 text-white hover:text-red-400"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Add tag"
                  value={newTags[note._id] || ""}
                  onChange={(e) =>
                    setNewTags({ ...newTags, [note._id]: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleAddTag(note)
                  }
                />
                <button
                  onClick={() => handleAddTag(note)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-4 text-sm">
                <button
                  onClick={() => {
                    setSelectedNote(note);
                    setModalOpen(true);
                  }}
                  className="text-blue-400 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        note={selectedNote}
        onSave={(savedNote) => {
          const exists = notes.find((n) => n._id === savedNote._id);
          if (exists) {
            const updated = notes.map((n) => (n._id === savedNote._id ? savedNote : n));
            setNotes([...updated].sort((a, b) => (b.isPinned === a.isPinned ? 0 : b.isPinned ? 1 : -1)));
          } else {
            setNotes((prev) =>
              [savedNote, ...prev].sort((a, b) => (b.isPinned === a.isPinned ? 0 : b.isPinned ? 1 : -1))
            );
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
};

export default NotesPage;
