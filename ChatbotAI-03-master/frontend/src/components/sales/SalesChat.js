import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, Check, Volume2, VolumeX, FileText } from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { getSocket } from '../../services/socket';
import VoiceMessagePlayer from '../voice/VoiceMessagePlayer';
import speechService from '../../services/SpeechService';
import audioTranscriptionService from '../../services/audioTranscription';

const SalesChat = ({ customer, onComplete }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { getConversationHistory, sendMessageToCustomer } = useSales();

  useEffect(() => {
    if (customer) {
      loadConversationHistory();
    }
  }, [customer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (socket && customer) {
      // Listen for new messages from this specific customer
      socket.on('customerMessage', (data) => {
        if (data.customerId === customer._id) {
          const newMsg = {
            id: data.id,
            text: data.text,
            userId: data.userId,
            username: data.username,
            timestamp: data.timestamp,
            isFromCustomer: true,
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            duration: data.duration
          };
          setMessages(prev => [...prev, newMsg]);
        }
      });

      // Listen for customer typing
      socket.on('customerTyping', (data) => {
        if (data.customerId === customer._id) {
          setCustomerTyping(true);
          // Clear existing timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          // Set new timeout
          typingTimeoutRef.current = setTimeout(() => {
            setCustomerTyping(false);
          }, 3000);
        }
      });

      socket.on('customerStopTyping', (data) => {
        if (data.customerId === customer._id) {
          setCustomerTyping(false);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
        }
      });

      // Listen for message sent confirmation
      socket.on('messageSent', (data) => {
        if (data.customerId === customer._id) {
          // Message was successfully sent
          console.log('Message sent successfully');
        }
      });

      return () => {
        socket.off('customerMessage');
        socket.off('customerTyping');
        socket.off('customerStopTyping');
        socket.off('messageSent');
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [customer]);

  const loadConversationHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getConversationHistory(customer._id);
      if (data) {
        const formattedMessages = data.messages.map(msg => ({
          id: msg._id,
          text: msg.text,
          username: msg.username,
          timestamp: msg.createdAt,
          isFromCustomer: !msg.isSalesResponse,
          isSalesResponse: msg.isSalesResponse,
          fileUrl: msg.fileUrl,
          fileType: msg.fileType,
          duration: msg.duration,
          audioTranscription: msg.audioTranscription
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Add message to local state immediately for instant feedback
    const tempMessage = {
      id: Date.now(),
      text: messageText,
      username: 'Sales Rep',
      timestamp: new Date(),
      isFromCustomer: false,
      isSalesResponse: true
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Send message via socket for real-time delivery
      const socket = getSocket();
      if (socket) {
        socket.emit('salesMessage', {
          customerId: customer._id,
          text: messageText
        });
      }

      // Also send via API for persistence
      await sendMessageToCustomer(customer._id, messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      // Show error message
      const errorMsg = {
        id: Date.now(),
        text: 'Failed to send message. Please try again.',
        username: 'System',
        timestamp: new Date(),
        isFromCustomer: false,
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleCompleteConversation = async () => {
    if (window.confirm('Mark this conversation as complete? The customer will be notified.')) {
      const success = await onComplete(customer._id);
      if (!success) {
        alert('Failed to complete conversation. Please try again.');
      }
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket && !isTyping) {
      socket.emit('salesTyping', { customerId: customer._id });
      setIsTyping(true);
      
      // Stop typing after 3 seconds of inactivity
      setTimeout(() => {
        setIsTyping(false);
        socket.emit('salesStopTyping', { customerId: customer._id });
      }, 3000);
    }
  };

  const speakMessage = async (text) => {

    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speechService.speak(text, {
        language: 'en-US',
        rate: 0.9,
        pitch: 1.0
      });
    } catch (error) {
      console.error('Speech synthesis failed:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const transcribeVoiceMessage = async (message) => {
    if (!message.fileUrl || !message.fileType?.startsWith('audio/')) return;

    try {
      const transcription = await audioTranscriptionService.transcribeAudioUrl(
        message.fileUrl,
        'en-US'
      );

      if (transcription.success) {
        // Update message with transcription
        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, audioTranscription: transcription.transcript }
            : msg
        ));
      }
    } catch (error) {
      console.error('Voice transcription failed:', error);
    }
  };

  const renderFileMessage = (message) => {
    const { fileUrl, fileType, fileName } = message;

    if (fileType?.startsWith('audio/')) {
      return (
        <div>
          <VoiceMessagePlayer 
            fileUrl={fileUrl} 
            duration={message.duration}
            isFromUser={message.isFromCustomer}
          />
          {message.isFromCustomer && !message.audioTranscription && (
            <button
              onClick={() => transcribeVoiceMessage(message)}
              className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition"
            >
              Transcribe Voice
            </button>
          )}
          {message.audioTranscription && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <strong>Transcription:</strong> {message.audioTranscription}
            </div>
          )}
        </div>
      );
    }

    if (fileType?.startsWith('image/')) {
      return (
        <img 
          src={fileUrl} 
          alt="uploaded" 
          className="max-w-full max-h-48 rounded border" 
        />
      );
    }

    if (fileType?.startsWith('video/')) {
      return (
        <video controls className="max-w-full max-h-48 rounded border">
          <source src={fileUrl} type={fileType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    // Default file display
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
        <FileText className="h-4 w-4 text-gray-500" />
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 underline text-sm hover:text-blue-800"
        >
          {fileName || 'Download File'}
        </a>
      </div>
    );
  };

  const renderMessage = (message, index) => {
    const isFromCustomer = message.isFromCustomer;
    const isError = message.isError;

    return (
      <div key={message.id} className={`flex ${isFromCustomer ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow relative group ${
          isError ? 'bg-red-100 text-red-800 border border-red-200' :
          isFromCustomer 
            ? 'bg-gray-200 text-gray-800' 
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <User className="h-3 w-3" />
            <span className="text-xs font-medium">{message.username}</span>
          </div>
          
          {message.fileUrl ? (
            renderFileMessage(message)
          ) : (
            <div className="relative">
              <p className="text-sm">{message.text}</p>
              {!isError && (
                <button
                  onClick={() => speakMessage(message.text)}
                  className={`absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                    isFromCustomer ? 'hover:bg-gray-300' : 'hover:bg-white/20'
                  }`}
                  title="Speak this message"
                >
                  {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </button>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-3 w-3 opacity-60" />
            <span className="text-xs opacity-60">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            {!isFromCustomer && !isError && <Check className="h-3 w-3 opacity-60" />}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-96">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              {customer.username}
            </h3>
            <p className="text-sm text-gray-600">{customer.email}</p>
            {customerTyping && (
              <p className="text-xs text-blue-600 animate-pulse">Customer is typing...</p>
            )}
          </div>
          <button
            onClick={handleCompleteConversation}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Mark Complete
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation with {customer.username}</p>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        
        {customerTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-gray-200 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder={`Reply to ${customer.username}...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
        {newMessage.length > 900 && (
          <p className="text-xs text-gray-500 mt-1">
            {1000 - newMessage.length} characters remaining
          </p>
        )}
      </form>
    </div>
  );
};

export default SalesChat;