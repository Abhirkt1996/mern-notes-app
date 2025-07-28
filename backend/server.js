import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"]
  }
});

app.use(express.json());

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join a collaboration room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle real-time note updates
  socket.on("note-update", (data) => {
    socket.to(data.roomId).emit("note-updated", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use("/api/users", authRoutes);
app.use("/api/notes", notesRoutes);

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

connectDB();

httpServer.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});