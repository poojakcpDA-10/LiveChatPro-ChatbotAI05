import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext.js';
import { initSocket, getSocket } from '../services/socket.js';

const ChatContext = createContext();

const initialState = {
  messages: [],
  activeUsers: [],
  isConnected: false,
  currentRoom: 'general',
  typing: []
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SOCKET_CONNECTED':
      return { ...state, isConnected: true };
    case 'SOCKET_DISCONNECTED':
      return { ...state, isConnected: false };
    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'UPDATE_ACTIVE_USERS':
      return {
        ...state,
        activeUsers: action.payload
      };
    case 'USER_TYPING':
      return {
        ...state,
        typing: [...state.typing.filter(u => u !== action.payload), action.payload]
      };
    case 'USER_STOP_TYPING':
      return {
        ...state,
        typing: state.typing.filter(u => u !== action.payload)
      };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = initSocket();
      
      socket.on('connect', () => {
        dispatch({ type: 'SOCKET_CONNECTED' });
        socket.emit('join', { userId: user.id, username: user.username });
      });

      socket.on('disconnect', () => {
        dispatch({ type: 'SOCKET_DISCONNECTED' });
      });
      socket.off('message');
      socket.on('message', (message) => {
        dispatch({ type: 'RECEIVE_MESSAGE', payload: message });
      });

      socket.on('activeUsers', (users) => {
        dispatch({ type: 'UPDATE_ACTIVE_USERS', payload: users });
      });

      socket.on('userTyping', (username) => {
        dispatch({ type: 'USER_TYPING', payload: username });
      });

      socket.on('userStopTyping', (username) => {
        dispatch({ type: 'USER_STOP_TYPING', payload: username });
      });

      return () => {};
    }
  }, [isAuthenticated, user]);

  const sendMessage = (message) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('message', {
        text: message,
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString()
      });
    }
  };

  const startTyping = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('typing', user.username);
    }
  };

  const stopTyping = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('stopTyping', user.username);
    }
  };

  return (
    <ChatContext.Provider value={{
      ...state,
      sendMessage,
      startTyping,
      stopTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};