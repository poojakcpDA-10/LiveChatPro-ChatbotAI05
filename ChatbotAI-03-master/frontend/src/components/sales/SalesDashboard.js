import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../context/SalesContext';
import { initSocket, getSocket } from '../../services/socket';
import CustomerChatList from './CustomerChatList';
import SalesChat from './SalesChat';
import { Users, MessageCircle, Clock, UserCheck, AlertCircle } from 'lucide-react';

const SalesDashboard = () => {
  const { user } = useAuth();
  const { conversations, fetchConversations } = useSales();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [salesRequests, setSalesRequests] = useState([]);
  const [claimedConversations, setClaimedConversations] = useState(new Map());
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeChats: 0,
    completedToday: 0,
    avgResponseTime: 0
  });

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sales/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'sales') {
      const socket = initSocket();
      
      // Initial data fetch
      fetchStats();
      fetchConversations();
      
      // Listen for new sales requests
      socket.on('newSalesRequest', (data) => {
        setSalesRequests(prev => {
          // Check if request already exists
          const exists = prev.some(req => req.customerId === data.customerId);
          if (!exists) {
            // Show notification
            if (Notification.permission === 'granted') {
              new Notification('New Sales Request', {
                body: `${data.customerName} is requesting support`,
                icon: '/favicon.ico'
              });
            }
            return [data, ...prev];
          }
          return prev;
        });
      });

      // Listen for conversation claims
      socket.on('conversationClaimed', (data) => {
        if (data.success) {
          // This salesperson claimed the conversation
          setSelectedCustomer({
            _id: data.customerId,
            username: data.customerName
          });
        } else {
          // Another salesperson claimed it
          setSalesRequests(prev => 
            prev.filter(req => req.customerId !== data.customerId)
          );
          setClaimedConversations(prev => 
            new Map(prev.set(data.customerId, data.claimedBy))
          );
        }
      });

      // Listen for conversation already claimed
      socket.on('conversationAlreadyClaimed', (data) => {
        alert(data.message);
      });

      // Listen for stats updates
      socket.on('statsUpdate', (newStats) => {
        setStats(newStats);
      });

      // Listen for conversation completion
      socket.on('conversationCompleted', (data) => {
        if (data.success && selectedCustomer?._id === data.customerId) {
          setSelectedCustomer(null);
        }
        // Refresh stats
        fetchStats();
      });

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Set up periodic stats refresh
      const statsInterval = setInterval(fetchStats, 30000); // Every 30 seconds

      return () => {
        socket.off('newSalesRequest');
        socket.off('conversationClaimed');
        socket.off('conversationAlreadyClaimed');
        socket.off('statsUpdate');
        socket.off('conversationCompleted');
        clearInterval(statsInterval);
      };
    }
  }, [user]);

  const handleSelectCustomer = async (customer) => {
    // If this is a new request, claim it first
    if (salesRequests.some(req => req.customerId === customer._id)) {
      try {
        const response = await fetch(`http://localhost:3001/api/sales/conversation/${customer._id}/claim`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSelectedCustomer({
            _id: customer._id,
            username: data.customer.username,
            email: data.customer.email
          });

          // Emit socket event to claim conversation
          const socket = getSocket();
          if (socket) {
            socket.emit('claimConversation', { customerId: customer._id });
          }

          // Remove from sales requests
          setSalesRequests(prev => 
            prev.filter(req => req.customerId !== customer._id)
          );
        } else {
          const errorData = await response.json();
          if (errorData.alreadyClaimed) {
            alert(errorData.message);
            // Remove from requests since it's claimed by someone else
            setSalesRequests(prev => 
              prev.filter(req => req.customerId !== customer._id)
            );
          }
        }
      } catch (error) {
        console.error('Failed to claim conversation:', error);
        alert('Failed to claim conversation. Please try again.');
      }
    } else {
      // Already claimed conversation
      setSelectedCustomer(customer);
    }
  };

  const handleCompleteConversation = async (customerId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/sales/conversation/${customerId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Emit socket event
        const socket = getSocket();
        if (socket) {
          socket.emit('completeConversation', { customerId });
        }

        setSelectedCustomer(null);
        fetchStats(); // Refresh stats
        return true;
      }
    } catch (error) {
      console.error('Failed to complete conversation:', error);
    }
    return false;
  };

  if (user?.role !== 'sales') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the sales dashboard.</p>
        </div>
      </div>
    );
  }

  // Combine sales requests and existing conversations
  const allConversations = [
    ...salesRequests.map(req => ({
      _id: req.customerId,
      username: req.customerName,
      email: req.customerEmail,
      lastMessage: req.message,
      lastMessageTime: req.timestamp,
      isNewRequest: true,
      status: 'waiting'
    })),
    ...conversations.filter(conv => 
      !salesRequests.some(req => req.customerId === conv._id)
    )
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Online
              </div>
              {salesRequests.length > 0 && (
                <div className="bg-red-100 tex-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {salesRequests.length} New Request{salesRequests.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeChats}</p>
                <p className="text-xs text-gray-500 mt-1">Currently ongoing</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                <p className="text-xs text-gray-500 mt-1">Resolved conversations</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}m</p>
                <p className="text-xs text-gray-500 mt-1">Average response</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Sales Requests Alert */}
        {salesRequests.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  {salesRequests.length} New Sales Request{salesRequests.length > 1 ? 's' : ''}
                </h3>
                <div className="mt-2 space-y-1">
                  {salesRequests.slice(0, 3).map((request, index) => (
                    <div key={index} className="text-sm text-yellow-700 flex items-center justify-between">
                      <span>{request.customerName} ({request.customerEmail}) is requesting support</span>
                      <button
                        onClick={() => handleSelectCustomer({ _id: request.customerId, username: request.customerName, email: request.customerEmail })}
                        className="ml-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs transition"
                      >
                        Claim
                      </button>
                    </div>
                  ))}
                  {salesRequests.length > 3 && (
                    <p className="text-sm text-yellow-600">
                      +{salesRequests.length - 3} more requests...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-1">
            <CustomerChatList
              conversations={allConversations}
              onSelectCustomer={handleSelectCustomer}
              selectedCustomer={selectedCustomer}
            />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedCustomer ? (
              <SalesChat 
                customer={selectedCustomer} 
                onComplete={handleCompleteConversation}
              />
            ) : (
              <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                  <p className="text-gray-500 mb-4">Select a customer from the list to start chatting</p>
                  {salesRequests.length > 0 && (
                    <p className="text-sm text-yellow-600">
                      {salesRequests.length} customer{salesRequests.length > 1 ? 's' : ''} waiting for support
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;