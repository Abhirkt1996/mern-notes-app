# 📓 Real-Time Collaborative Notes App

A real-time collaborative note-taking web application that allows multiple users to edit shared notes simultaneously. No authentication or login required — just share the link and start collaborating instantly.

---

## 🚀 Features

- ✍️ Create and edit notes in real-time
- 🔗 Shareable Note Rooms (e.g., `/note/:noteId`)
- 🌐 WebSocket-powered live updates across tabs/devices
- 📏 Persistent storage with MongoDB
- 👥 Active collaborators list (optional/bonus)

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Socket.IO Client
- **Backend:** Node.js + Express + Socket.IO + MongoDB
- **Database:** MongoDB (Mongoose)
- **Communication:** WebSockets via Socket.IO

---

## 📁 Folder Structure

```
/client          # React frontend
/server          # Express backend with Socket.IO
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Abhirkt1996/mern-notes-app.git
cd realtime-notes-app
```

### 2. Setup Backend

```bash
cd server
npm install
# Create a `.env` file
touch .env
```

Add your MongoDB URI to `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/realtime-notes?retryWrites=true&w=majority

```

Then run the server:

```bash
npm run dev
```

### 3. Setup Frontend

In a new terminal tab:

```bash
cd client
npm install
npm run dev
```

---

## 🦯 Test the App

1. Open [http://localhost:5173](http://localhost:5173)
2. Create a new note room (e.g., `/note/abc123`)
3. Open the same URL in a different tab or browser
4. Start typing — edits sync instantly between tabs!

---

## ✨ Bonus Feature: Active Collaborators

- Users connected to a room are tracked using `socket.id`
- Display active users in a list (e.g., “2 people editing...”)
- Implement using a `Set` or `Map` of socket IDs per note room

---

## 🧰 API Endpoints

### `GET /api/notes/:id`

Fetch a note by ID

### `POST /api/notes/:id`

Create or update a note

---

## 🔌 Socket.IO Events

| Event              | Description                         |
|--------------------|-------------------------------------|
| `join-note`        | Join a note room                    |
| `send-changes`     | Emit local changes to server        |
| `receive-changes`  | Broadcast changes to all clients    |
| `save-note`        | Trigger save to MongoDB             |
| `get-users`        | Return list of active collaborators |

---

## 📝 License

MIT — feel free to use and modify.

---

## 🙌 Acknowledgments

- Inspired by Google Docs collaboration model
- Built for learning WebSocket and real-time sync with MongoDB
