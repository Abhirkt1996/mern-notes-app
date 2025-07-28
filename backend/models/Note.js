import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [{
      email: {
        type: String,
        required: true
      },
      permission: {
        type: String,
        enum: ["read", "write"],
        default: "read"
      }
    }],
    tags: [{
      type: String,
      trim: true
    }],
    isPinned: {
      type: Boolean,
      default: false
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;