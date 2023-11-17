const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

require('dotenv').config();

const app = express(cors());
const MAX_USERS_PER_ROOM = 5;
const socket_io_client = 'http://localhost:5173'

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: socket_io_client,
    methods: ['GET', 'POST'],
  },
});

const rooms = {};

const get_rooms_info = () => {
  return Object.keys(rooms).map((room) => ({
    name: room,
    users: rooms[room].length,
    maxUsers: MAX_USERS_PER_ROOM,
  }));
};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('getRooms', (callback) => {
    callback(get_rooms_info());
  });

  socket.on('createRoom', (roomName) => {
    rooms[roomName] = [];
    io.emit('updateRooms', get_rooms_info());
  });

  socket.on('joinRoom', (room, callback) => {
    let ans = false;
    if (rooms[room] && rooms[room].length < MAX_USERS_PER_ROOM) {
      Object.keys(rooms).forEach((room) => {
        const index = rooms[room].indexOf(socket.id);
        if (index !== -1) {
          rooms[room].splice(index, 1);
        }
      });
      socket.join(room);
      rooms[room].push(socket.id);
      ans = true;
      console.log(`User ${socket.id} joined room ${room}`);
    }
    io.emit('updateRooms', get_rooms_info());
    callback(ans);
  });

  socket.on('sendMessage', ({ room, message, nickname }) => {
    io.to(room).emit('message', message, nickname);
    rooms[room].push(message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    Object.keys(rooms).forEach((room) => {
      const index = rooms[room].indexOf(socket.id);
      if (index !== -1) {
        rooms[room].splice(index, 1);
        io.emit('updateRooms', get_rooms_info());
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
