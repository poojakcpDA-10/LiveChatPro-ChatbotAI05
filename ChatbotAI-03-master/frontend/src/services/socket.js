
import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token'); //  Get the token from storage

    socket = io('http://localhost:3001', {
      transports: ['websocket'],
      upgrade: false,
      auth: {
        token: token  //  Send token to backend during handshake
      },
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log(' Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error(' Socket connection error:', err.message);
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

