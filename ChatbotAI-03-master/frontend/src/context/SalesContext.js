import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SalesContext = createContext();

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

export const SalesProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (user?.role !== 'sales') return;
    
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/sales/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationHistory = async (customerId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/sales/conversation/${customerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
      return null;
    }
  };

  const sendMessageToCustomer = async (customerId, text) => {
    try {
      await axios.post('http://localhost:3001/api/sales/message', 
        { customerId, text },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  const completeConversation = async (customerId) => {
    try {
      await axios.post(`http://localhost:3001/api/sales/conversation/${customerId}/complete`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchConversations(); // Refresh conversations
      return true;
    } catch (error) {
      console.error('Failed to complete conversation:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user?.role === 'sales') {
      fetchConversations();
    }
  }, [user]);

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    isLoading,
    fetchConversations,
    getConversationHistory,
    sendMessageToCustomer,
    completeConversation
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};