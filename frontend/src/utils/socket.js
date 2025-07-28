import { io } from "socket.io-client";

const URL = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000';

const socket = io(URL, {
  autoConnect: true,
});

// Socket event listeners
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Room management
export const joinRoom = (roomId) => {
  socket.emit('join-room', roomId);
};

// Note collaboration
export const emitNoteUpdate = (noteData) => {
  socket.emit('note-update', noteData);
};

export default socket;
