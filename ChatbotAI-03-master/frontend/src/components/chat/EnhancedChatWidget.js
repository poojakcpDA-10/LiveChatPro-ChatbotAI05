import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, MessageCircle, XCircle, Paperclip, Trash2, Smile, Volume2, VolumeX, Bot, Settings } from 'lucide-react';
import axios from 'axios';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.js';
import VoiceRecorder from '../voice/VoiceRecorder'; 
import VoiceMessagePlayer from '../voice/VoiceMessagePlayer';
import speechService from '../../services/SpeechService';
import { getSocket, initSocket } from '../../services/socket';

const EnhancedChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('auto');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('en-US');
  const [smartReplies, setSmartReplies] = useState([]);
  const [showSmartReplies, setShowSmartReplies] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [salesSupported, setSalesSupported] = useState(false);
  const [salesRepName, setSalesRepName] = useState('');
  const [salesRepId, setSalesRepId] = useState('');
  const [isWaitingForSales, setIsWaitingForSales] = useState(false);
  const [conversationCompleted, setConversationCompleted] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { isAuthenticated, user } = useAuth();

  // Language options for the interface
  const languageOptions = [
    { code: 'auto', name: 'Auto Detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ar', name: 'Arabic' }
  ];

  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0 && !salesSupported && !isWaitingForSales) {
      generateSmartReplies();
    }
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated) {
      const socket = initSocket();
      
      // Listen for sales rep joining
      socket.on('salesRepJoined', (data) => {
        setSalesSupported(true);
        setSalesRepName(data.salesRepName);
        setSalesRepId(data.salesRepId);
        setConversationCompleted(false);
        const salesMsg = {
          from: 'sales',
          text: data.message,
          timestamp: new Date(),
          isSalesResponse: true
        };
        setMessages(prev => [...prev, salesMsg]);
        setIsWaitingForSales(false);
      });

      // Listen for sales messages
      socket.on('message', (data) => {
        if (data.isSalesResponse && data.salesPersonId) {
          const salesMsg = {
            from: 'sales',
            text: data.text,
            timestamp: new Date(data.timestamp),
            isSalesResponse: true,
            salesPersonId: data.salesPersonId
          };
          setMessages(prev => [...prev, salesMsg]);
        }
      });

      // Listen for sales typing indicators
      socket.on('salesTyping', (data) => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      });

      socket.on('salesStopTyping', () => {
        setIsTyping(false);
      });

      // Listen for sales request confirmation
      socket.on('salesRequestSent', (data) => {
        const confirmMsg = {
          from: 'bot',
          text: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, confirmMsg]);
        setIsWaitingForSales(true);
      });

      // Listen for sales rep disconnection
      socket.on('salesRepDisconnected', (data) => {
        const disconnectMsg = {
          from: 'bot',
          text: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, disconnectMsg]);
        setSalesSupported(false);
        setSalesRepName('');
        setSalesRepId('');
        setIsWaitingForSales(true);
      });

      // Listen for conversation completion
      socket.on('conversationCompleted', (data) => {
        const completedMsg = {
          from: 'bot',
          text: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completedMsg]);
        setSalesSupported(false);
        setSalesRepName('');
        setSalesRepId('');
        setIsWaitingForSales(false);
        setConversationCompleted(true);
      });

      return () => {
        socket.off('salesRepJoined');
        socket.off('message');
        socket.off('salesTyping');
        socket.off('salesStopTyping');
        socket.off('salesRequestSent');
        socket.off('salesRepDisconnected');
        socket.off('conversationCompleted');
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Update speech language when selected language changes
    if (selectedLang !== 'auto') {
      setSpeechLanguage(speechService.normalizeLangCode(selectedLang));
    }
  }, [selectedLang]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  // Generate smart reply suggestions
  const generateSmartReplies = async () => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.from === 'user') return; // Only generate for bot messages
    
    try {
      const response = await axios.post('http://localhost:3001/api/chat/smart-replies', {
        lastMessage: lastMessage.text,
        language: selectedLang === 'auto' ? 'en' : selectedLang
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setSmartReplies(response.data.suggestions || []);
    } catch (error) {
      console.error('Failed to generate smart replies:', error);
      setSmartReplies([]);
    }
  };

  // Handle smart reply selection
  const selectSmartReply = (reply) => {
    setMessage(reply);
    setSmartReplies([]);
    inputRef.current?.focus();
  };

  // Detect language of input text
  const detectLanguage = async (text) => {
    if (!text.trim()) return 'en';
    
    try {
      const response = await axios.post('http://localhost:3001/api/chat/detect-language', {
        text: text
      });
      return response.data.language || 'en';
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'en';
    }
  };

  // Translate text using custom service
  const translateText = async (text, target, source = 'auto') => {
    try {
      const response = await axios.post('http://localhost:3001/api/chat/translate', {
        q: text,
        source: source,
        target: target,
      });
      return response.data.translatedText || text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const requestSalesSupport = () => {
    const socket = getSocket();
    if (socket && user) {
      socket.emit('requestSalesSupport', {
        message: 'Customer requesting human sales support'
      });
      
      const requestMsg = {
        from: 'user',
        text: 'I would like to speak with a sales representative',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, requestMsg]);
    }
  };

  const handleVoiceMessageTranscription = async (voiceMessage) => {
    try {
      if (voiceMessage.fileUrl) {
        const transcription = await audioTranscriptionService.transcribeAudioUrl(
          voiceMessage.fileUrl, 
          speechLanguage
        );
        
        if (transcription.success) {
          // Add transcribed text as AI response
          const transcribedMsg = {
            from: 'bot',
            text: `Voice message transcription: "${transcription.transcript}"`,
            timestamp: new Date(),
            confidence: transcription.confidence
          };
          setMessages(prev => [...prev, transcribedMsg]);

          // Get AI response to transcribed text if not in sales mode
          if (!salesSupported && !isWaitingForSales) {
            const aiResponse = await getAIResponse(transcription.transcript, selectedLang === 'auto' ? 'en' : selectedLang);
            const botMsg = { 
              from: 'bot', 
              text: aiResponse, 
              timestamp: new Date() 
            };
            setMessages(prev => [...prev, botMsg]);
          }
        }
      }
    } catch (error) {
      console.error('Voice transcription failed:', error);
    }
  };

  // Get AI response using custom service
  const getAIResponse = async (userMessage, detectedLang) => {
    try {
      const response = await axios.post('http://localhost:3001/api/chat/ai-response', {
        message: userMessage,
        language: detectedLang,
        conversationHistory: messages.slice(-5) // Send last 5 messages for context
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      return response.data.text;
    } catch (error) {
      console.error('AI response failed:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  };

  // Send message with proper routing
  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setIsTyping(true);
    const userMessage = message.trim();
    setMessage('');
    setSmartReplies([]);

    try {
      // Add user message to chat
      const userMsg = { from: 'user', text: userMessage, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);

      // If sales support is active, send message via socket to assigned sales rep
      if (salesSupported) {
        const socket = getSocket();
        if (socket) {
          socket.emit('customerMessage', {
            text: userMessage,
            room: 'general'
          });
        }
        
        // Store message in backend
        await axios.post(
          'http://localhost:3001/api/chat/messages',
          { 
            messages: [{ from: 'user', text: userMessage }], 
            userLang: selectedLang === 'auto' ? 'en' : selectedLang 
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        return;
      }

      // If waiting for sales, just store the message
      if (isWaitingForSales) {
        await axios.post(
          'http://localhost:3001/api/chat/messages',
          { 
            messages: [{ from: 'user', text: userMessage }], 
            userLang: selectedLang === 'auto' ? 'en' : selectedLang 
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        return;
      }

      // Check for sales request keywords
      const salesKeywords = ['human', 'representative', 'salesperson', 'sales', 'agent', 'support person'];
      const requestingSales = salesKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );

      if (requestingSales) {
        requestSalesSupport();
        return;
      }

      // Detect language if auto-detect is enabled
      const detectedLang = selectedLang === 'auto' ? 
        await detectLanguage(userMessage) : selectedLang;

      // Get AI response
      const aiResponse = await getAIResponse(userMessage, detectedLang);
      
      // Add AI response to chat
      const botMsg = { from: 'bot', text: aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);

      // Auto-speak AI response if enabled
      if (autoSpeak && aiResponse) {
        try {
          await speechService.speak(aiResponse, {
            language: speechLanguage,
            rate: 0.9,
            pitch: 1.0
          });
        } catch (speechError) {
          console.error('Speech synthesis failed:', speechError);
        }
      }

    
    } finally {
      setIsTyping(false);
    }
  };

  // Speech-to-text functionality
  const startListening = async () => {
    try {
      setIsListening(true);
      const result = await speechService.listen({
        language: speechLanguage,
        timeout: 10000
      });
      
      if (result.success && result.transcript) {
        setMessage(prev => prev + result.transcript);
      }
    } catch (error) {
      console.error('Speech recognition failed:', error);
      alert('Speech recognition failed. Please check your microphone permissions.');
    } finally {
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  // Text-to-speech for any message
  const speakMessage = async (text) => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speechService.speak(text, {
        language: speechLanguage,
        rate: 0.9,
        pitch: 1.0
      });
    } catch (error) {
      console.error('Speech synthesis failed:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const renderFileMessage = (msg, index) => {
    const { fileUrl, fileType = '', fileName = '', text = '', duration } = msg;

    if (fileType.startsWith('image/')) {
      return (
        <div>
          <img src={fileUrl} alt="uploaded" className="max-w-full max-h-48 rounded-lg border" />
          <a href={fileUrl} download target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline block mt-1">
            View Image
          </a>
        </div>
      );
    }

    if (fileType.startsWith('audio/')) {
      return (
        <div>
          <VoiceMessagePlayer fileUrl={fileUrl} duration={duration} />
          {msg.from === 'user' && !salesSupported && !isWaitingForSales && (
            <button
              onClick={() => handleVoiceMessageTranscription(msg)}
              className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition"
            >
              Get AI Response to Voice
            </button>
          )}
        </div>
      );
    }

    if (fileType.startsWith('video/')) {
      return (
        <div>
          <video controls className="max-w-full max-h-64 rounded-lg border">
            <source src={fileUrl} type={fileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (fileType === 'application/pdf') {
      return (
        <div>
          <iframe src={fileUrl} className="w-full h-64 rounded border" title="PDF Preview"></iframe>
          <a href={fileUrl} download target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline block mt-1">
            View PDF
          </a>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-xl">📁</span>
        <a href={fileUrl} download target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
          {text || `View ${fileName}`}
        </a>
      </div>
    );
  };

  const clearChat = () => {
    setMessages([]);
    setSmartReplies([]);
    setSalesSupported(false);
    setSalesRepName('');
    setSalesRepId('');
    setIsWaitingForSales(false);
    setConversationCompleted(false);
    setShowConfirmModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeMB = 10;
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = { from: 'bot', text: `File too large. Max: ${maxSizeMB}MB.`, timestamp: new Date() };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('room', 'general');

    try {
      const res = await axios.post('http://localhost:3001/api/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      const fileMessage = {
        from: 'user',
        fileUrl: `http://localhost:3001/api/chat/download/${res.data.fileId}`,
        fileType: file.type,
        fileName: res.data.fileName,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, fileMessage]);
      setUploadProgress(0);
    } catch (err) {
      const errorMsg = { from: 'bot', text: 'File upload failed.', timestamp: new Date() };
      setMessages((prev) => [...prev, errorMsg]);
      setUploadProgress(0);
    }
  };

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 font-semibold flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <span>
          {salesSupported ? `Sales Rep: ${salesRepName}` : 
           isWaitingForSales ? 'Connecting to Sales...' : 
           conversationCompleted ? 'Conversation Completed' : 'AI Assistant'}
        </span>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
          {selectedLang === 'auto' ? 'Auto' : languageOptions.find(l => l.code === selectedLang)?.name}
        </span>
        {isWaitingForSales && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-xs">Waiting for sales rep...</span>
          </div>
        )}
        {salesSupported && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs">Sales rep online</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center">
        {!salesSupported && !isWaitingForSales && !conversationCompleted && (
          <button 
            onClick={requestSalesSupport}
            title="Request Sales Support" 
            className="hover:bg-white/20 p-1 rounded transition text-xs bg-white/10 px-2"
          >
            Talk to Sales
          </button>
        )}
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          title="Settings" 
          className="hover:bg-white/20 p-1 rounded transition"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button 
          onClick={() => setShowConfirmModal(true)} 
          title="Clear Chat" 
          className="hover:bg-white/20 p-1 rounded transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={() => setIsOpen(false)} 
          title="Close Chat"
          className="hover:bg-white/20 p-1 rounded transition"
        >
          <XCircle className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );

  const renderMessage = (msg, idx) => {
    const isUser = msg.from === 'user';
    const isSales = msg.from === 'sales' || msg.isSalesResponse;
    const isBot = msg.from === 'bot';

    let bgColor = 'bg-gray-100 text-gray-800';
    let alignment = 'justify-start';

    if (isUser) {
      bgColor = 'bg-blue-500 text-white';
      alignment = 'justify-end';
    } else if (isSales) {
      bgColor = 'bg-green-500 text-white';
      alignment = 'justify-start';
    }

    return (
      <div key={idx} className={`w-full flex ${alignment} mb-2`}>
        <div className={`break-words px-4 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap shadow-md relative group ${bgColor}`}>
          {msg.fileUrl ? renderFileMessage(msg, idx) : msg.text}
          
          {/* Speak button for text messages */}
          {!msg.fileUrl && msg.text && (
            <button
              onClick={() => speakMessage(msg.text)}
              className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                isUser || isSales ? 'hover:bg-white/20' : 'hover:bg-gray-200'
              }`}
              title="Speak this message"
            >
              {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleVoiceRecorderFinish = (res) => {
    if (res?.fileId) {
      const voiceMsg = {
        from: 'user',
        fileUrl: `http://localhost:3001/api/chat/download/${res.fileId}`,
        fileType: 'audio/webm',
        fileName: res.fileName,
        duration: res.duration,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, voiceMsg]);
      
      // Only auto-transcribe if not in sales mode
      if (!salesSupported && !isWaitingForSales) {
        handleVoiceMessageTranscription(voiceMsg);
      }
    }
  };

  if (!isAuthenticated) return null;

  const isInputDisabled = isTyping || (!salesSupported && isWaitingForSales) || conversationCompleted;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-96 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-300">
          {/* Header */}
          {renderHeader()}

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-50 p-4 border-b space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select 
                  value={selectedLang} 
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  {languageOptions.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={autoSpeak} 
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="rounded"
                  />
                  Auto-speak responses
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showSmartReplies} 
                    onChange={(e) => setShowSmartReplies(e.target.checked)}
                    className="rounded"
                  />
                  Smart replies
                </label>
              </div>
            </div>
          )}

          {/* Smart Replies */}
          {showSmartReplies && smartReplies.length > 0 && !salesSupported && !isWaitingForSales && !conversationCompleted && (
            <div className="bg-blue-50 p-3 border-b">
              <div className="text-xs font-medium text-gray-600 mb-2">Quick replies:</div>
              <div className="flex flex-wrap gap-2">
                {smartReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => selectSmartReply(reply)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs transition"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="p-4 h-64 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, idx) => renderMessage(msg, idx))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-2">
                <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex items-center p-2 border-t gap-2">
            {/* Voice Recording */}
            <VoiceRecorder onFinish={handleVoiceRecorderFinish} />

            {/* Speech-to-Text */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isInputDisabled}
              className={`p-2 rounded-full transition ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 
                isInputDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-100 hover:bg-purple-400 text-gray-600'
              }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* File Upload */}
            <input
              type="file"
              id="fileUpload"
              accept=".png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.mp4,.wav,.avi,.mov,.mkv,.csv"
              onChange={handleFileUpload}
              disabled={isInputDisabled}
              hidden
            />
            <button 
              type="button" 
              onClick={() => document.getElementById('fileUpload').click()} 
              disabled={isInputDisabled}
              className={`p-2 rounded-full transition ${
                isInputDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'
              }`} 
              title="Upload File"
            >
              <Paperclip className="h-5 w-5 text-gray-600" />
            </button>

            {/* Emoji Picker */}
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker((prev) => !prev)} 
              disabled={isInputDisabled}
              className={`p-2 rounded-full transition ${
                isInputDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'
              }`} 
              title="Emoji"
            >
              <Smile className="h-5 w-5 text-gray-600" />
            </button>
            
            {showEmojiPicker && !isInputDisabled && (
              <div className="absolute bottom-20 right-2 z-50">
                <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
              </div>
            )}

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                conversationCompleted ? "Conversation completed" :
                salesSupported ? "Reply to sales rep..." : 
                isWaitingForSales ? "Waiting for sales rep..." : 
                "Type your message..."
              }
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isInputDisabled}
            />

            {/* Send Button */}
            <button 
              type="submit" 
              disabled={isInputDisabled || !message.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="px-4 py-2 bg-blue-50">
              <div className="flex items-center justify-between text-xs text-blue-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <motion.button 
          onClick={() => setIsOpen(true)} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      )}

      {/* Clear Chat Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-80 shadow-lg text-center"
          >
            <h2 className="text-lg font-semibold mb-4">Clear Chat History?</h2>
            <p className="text-sm text-gray-600 mb-6">This will remove all messages from this session. This action cannot be undone.</p>
            <div className="flex justify-between gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="flex-1 px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={clearChat} 
                className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Clear
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatWidget;