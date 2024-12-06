import { io } from 'socket.io-client';
import useAuthStore from '../stores/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling']
});

// Connect and authenticate socket when user logs in
socket.on('connect', () => {
  const user = useAuthStore.getState().user;
  if (user) {
    socket.emit('authenticate', user._id);
  }
});

// Handle reconnection
socket.on('reconnect', () => {
  const user = useAuthStore.getState().user;
  if (user) {
    socket.emit('authenticate', user._id);
  }
});

// Connect socket when initialized
socket.connect();

export default socket; 