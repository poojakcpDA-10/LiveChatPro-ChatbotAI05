import React from 'react';
import { MessageCircle, Clock, AlertCircle, User, Mail, CheckCircle } from 'lucide-react';

const CustomerChatList = ({ conversations, onSelectCustomer, selectedCustomer }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'No message';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const getStatusInfo = (conversation) => {
    if (conversation.isNewRequest) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: AlertCircle,
        label: 'NEW',
        description: 'Waiting for response'
      };
    }
    
    if (conversation.status === 'active') {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle,
        label: 'ACTIVE',
        description: 'In conversation'
      };
    }

    if (conversation.status === 'completed') {
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: CheckCircle,
        label: 'DONE',
        description: 'Completed'
      };
    }

    return {
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: MessageCircle,
      label: 'CHAT',
      description: 'Active conversation'
    };
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    // Priority order: new requests first, then by timestamp
    if (a.isNewRequest && !b.isNewRequest) return -1;
    if (!a.isNewRequest && b.isNewRequest) return 1;
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Customer Conversations
        </h2>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
          {conversations.filter(c => c.isNewRequest).length > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {conversations.filter(c => c.isNewRequest).length} new
            </div>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active conversations</p>
            <p className="text-sm text-gray-400 mt-1">
              Customers will appear here when they request support
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {sortedConversations.map((conversation) => {
              const statusInfo = getStatusInfo(conversation);
              const StatusIcon = statusInfo.icon;
              const isSelected = selectedCustomer?._id === conversation._id;

              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelectCustomer(conversation)}
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  } ${conversation.isNewRequest ? 'bg-yellow-50 hover:bg-yellow-100' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.username}
                        </p>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>
                      
                      {conversation.email && (
                        <div className="flex items-center gap-1 mb-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            {conversation.email}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {truncateMessage(conversation.lastMessage)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {conversation.messageCount && (
                            <span className="text-xs text-gray-400">
                              {conversation.messageCount} msg{conversation.messageCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {conversation.isNewRequest ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCustomer(conversation);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition"
                            >
                              Claim
                            </button>
                          ) : isSelected ? (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          ) : null}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {statusInfo.description}
                      </div>
                    </div>
                  </div>
                  
                  {conversation.isNewRequest && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-xs text-yellow-800 font-medium">
                          Customer requesting human support
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Click to claim this conversation and start helping the customer.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Summary Footer */}
      <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            {conversations.filter(c => c.isNewRequest).length} waiting • {' '}
            {conversations.filter(c => c.status === 'active').length} active • {' '}
            {conversations.filter(c => c.status === 'completed').length} completed
          </span>
          <span className="text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerChatList;