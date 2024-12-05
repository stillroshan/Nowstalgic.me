let io;

export const initializeSocket = (socketIO) => {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Join user's personal room for notifications
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
      // Clean up any room subscriptions
      socket.rooms.forEach(room => socket.leave(room));
    });
  });
};

export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(userId.toString()).emit('notification', notification);
  }
};

export const emitTimelineUpdate = (timelineId, update) => {
  if (io) {
    io.emit(`timeline:${timelineId}`, update);
  }
};

export const emitEventUpdate = (eventId, update) => {
  if (io) {
    io.emit(`event:${eventId}`, update);
  }
}; 