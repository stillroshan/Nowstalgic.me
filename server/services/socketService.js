import { Server } from 'socket.io';
let io;

// Store user socket mappings
const userSockets = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId); // Join personal room
    });

    // Handle timeline room joining
    socket.on('joinTimeline', (timelineId) => {
      socket.join(`timeline:${timelineId}`);
    });

    // Handle timeline room leaving
    socket.on('leaveTimeline', (timelineId) => {
      socket.leave(`timeline:${timelineId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
    });

    // Handle typing events
    socket.on('typing', (recipientId) => {
      io.to(recipientId).emit('userTyping', socket.userId);
    });

    socket.on('stopTyping', (recipientId) => {
      io.to(recipientId).emit('userStoppedTyping', socket.userId);
    });
  });

  return io;
};

// Emit new message
export const emitNewMessage = (recipientId, message) => {
  if (io) {
    io.to(recipientId.toString()).emit('newMessage', message);
  }
};

// Emit message read status
export const emitMessageRead = (recipientId, readerId) => {
  if (io) {
    io.to(recipientId.toString()).emit('messagesRead', readerId);
  }
};

// Add the missing emitNotification function
export const emitNotification = (recipientId, notification) => {
  if (io) {
    io.to(recipientId.toString()).emit('notification', notification);
  }
};

// Add the missing emitTimelineUpdate function
export const emitTimelineUpdate = (timelineId, update) => {
  if (io) {
    io.to(`timeline:${timelineId}`).emit('timelineUpdate', update);
  }
};

// Add the missing emitEventUpdate function
export const emitEventUpdate = (timelineId, update) => {
  if (io) {
    io.to(`timeline:${timelineId}`).emit('eventUpdate', update);
  }
};

// Get socket instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}; 