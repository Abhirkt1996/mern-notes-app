import express from "express";
import Note from "../models/Note.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

//  Get all notes — pinned first, includes tags
router.get("/", protect, async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { createdBy: req.user._id },
        { 'sharedWith.email': req.user.email },
        { isPublic: true }
      ]
    })
    .sort({ isPinned: -1, updatedAt: -1 }) // pinned notes first
    .populate('createdBy', 'name email');

    res.json(notes);
  } catch (err) {
    console.error("Get all notes error: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a note
router.post("/", protect, async (req, res) => {
  const { title, description, tags, isPinned, isPublic } = req.body;
  try {
    if (!title || !description) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const note = await Note.create({
      title,
      description,
      createdBy: req.user._id,
      tags: tags || [],
      isPinned: isPinned || false,
      isPublic: isPublic || false
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single note
router.get("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a note
router.put("/:id", protect, async (req, res) => {
  const { title, description, tags, isPinned, isPublic } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const isSharedWithUser = note.sharedWith.some(
      share => share.email === req.user.email && share.permission === 'write'
    );

    if (note.createdBy.toString() !== req.user._id.toString() && !isSharedWithUser) {
      return res.status(401).json({ message: "Not authorized" });
    }

    note.title = title || note.title;
    note.description = description || note.description;
    if (tags) note.tags = tags;
    if (typeof isPinned !== 'undefined') note.isPinned = isPinned;
    if (typeof isPublic !== 'undefined') note.isPublic = isPublic;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Share a note
router.post("/:id/share", protect, async (req, res) => {
  const { email, permission } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to share this note" });
    }

    const existingShare = note.sharedWith.find(share => share.email === email);
    if (existingShare) {
      existingShare.permission = permission || existingShare.permission;
    } else {
      note.sharedWith.push({ email, permission: permission || 'read' });
    }

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Remove a shared user
router.delete("/:id/share", protect, async (req, res) => {
  const { email } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    note.sharedWith = note.sharedWith.filter(share => share.email !== email);
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle pin status
router.put("/:id/pin", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    note.isPinned = !note.isPinned;

    // Ensure tags are preserved
    if (!note.tags) {
      note.tags = [];
    }

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    console.error("Error toggling pin:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a note
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await note.deleteOne();
    res.json({ message: "Note was deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
