const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  // Listen for new messages
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));

  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit('message received', newMessageRecieved);
    });
  });

  socket.off('setup', (userData) => {
    console.log('USER DISCONNECTED');
    socket.leave(userData._id);
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
