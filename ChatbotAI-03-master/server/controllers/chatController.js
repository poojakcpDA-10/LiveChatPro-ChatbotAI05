const { getBucket } = require('../config/gridFs');
const Message = require('../models/Message');
 const User = require('../models/User');
 const { Readable } = require('stream');
 const mongoose = require('mongoose');
const CustomAIService = require('../services/CustomAIService');

// Get chat messages
const getMessages = async (req, res) => {
  try {
    const { room = 'general', page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'username')
      .exec();

    const total = await Message.countDocuments({ room });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const postMessages = async (req, res) => {
  try {
    const { messages, userLang } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ message: 'Invalid request: messages must be an array.' });
    }

    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized: userId not found in token' });

    const user = await require('../models/User').findById(userId);
    const username = user?.username || 'User';

    const saved = await Promise.all(
      messages.map((msg) => {
        const isUser = msg.from === 'user';
        return new Message({
          text: msg.text,
          username: isUser ? username : 'AI Assistant',
          userId,
          room: 'general',
          lang: userLang || 'en',
          isAIResponse: msg.from === 'bot',
          messageType: msg.fileUrl ? 'file' : 'text'
        }).save().catch((err) => {
          console.error('Error saving message:', err.message);
        });
      })
    );

    res.status(200).json({ message: 'Messages stored', saved });
  } catch (err) {
    console.error('Store chat error:', err);
    res.status(500).json({ message: 'Failed to store messages' });
  }
};

const fileupload = async (req, res) => {
  const bucket = getBucket();
  if (!req.file) return res.status(400).json({ message: 'No file provided' });

  const readableStream = Readable.from(req.file.buffer);
  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
    metadata: {
      userId: req.user.userId,
      duration: req.body.duration,
      language: req.body.language,
      uploadedAt: new Date()
    }
  });

  uploadStream.contentType = req.file.mimetype;

  readableStream.pipe(uploadStream)
    .on('error', (err) => {
      console.error('Upload error:', err);
      res.status(500).json({ message: 'Upload failed' });
    })
    .on('finish', () => {
      res.status(200).json({
        message: 'Upload successful',
        fileId: uploadStream.id,
        fileName: uploadStream.filename,
        url: `/api/chat/download/${uploadStream.id}`,
      });
    });
};

const DownloadOp = async (req, res) => {
  const bucket = getBucket();

  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid file ID' });

    const fileId = new mongoose.Types.ObjectId(id);
    const file = await bucket.find({ _id: fileId }).toArray();
    if (!file || file.length === 0) return res.status(404).json({ message: 'File not found' });

    res.setHeader('Content-Type', file[0].contentType || 'audio/webm');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', file[0].length);
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('ETag', file[0]._id.toString());

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) res.status(500).json({ message: 'Stream error' });
    });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ message: 'Download failed' });
  }
};

const detectLang = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const detectedLanguage = CustomAIService.detectLanguage(text);
    res.json({ language: detectedLanguage, confidence: 0.85 });
  } catch (err) {
    console.error('Language detection error:', err.message);
    res.json({ language: 'en', confidence: 0 });
  }
};

const translation = async (req, res) => {
  try {
    const { q, source, target } = req.body;
    if (!q || !target) return res.status(400).json({ error: 'Text and target language are required' });

    const result = await CustomAIService.translateText(q, source || 'auto', target);
    res.json({
      translatedText: result.translatedText,
      detectedSourceLanguage: result.detectedSourceLanguage,
      confidence: result.confidence
    });
  } catch (err) {
    console.error('Translation error:', err.message);
    res.status(500).json({ error: 'Translation failed' });
  }
};

const AIresp = async (req, res) => {
  try {
    const { message, language, conversationHistory } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const response = await CustomAIService.generateChatResponse(message, {
      language: language || 'en',
      conversationHistory: conversationHistory || [],
      userPreferences: {}
    });

    res.json({
      text: response.text,
      language: response.language,
      model: 'custom-ai-service',
      confidence: response.confidence
    });
  } catch (err) {
    console.error('AI response error:', err.message);
    res.status(500).json({ error: 'AI response failed' });
  }
};

const smartReply = async (req, res) => {
  try {
    const { lastMessage, language } = req.body;
    if (!lastMessage) return res.status(400).json({ error: 'Last message is required' });

    const suggestions = await CustomAIService.generateSmartReplies(lastMessage, language || 'en', 3);
    res.json({ suggestions });
  } catch (err) {
    console.error('Smart replies error:', err);
    res.status(500).json({
      error: 'Failed to generate suggestions',
      suggestions: ['I see', 'Interesting', 'Got it']
    });
  }
};

const Analytic = async (req, res) => {
  try {
    const userId = req.user.userId;

    const analytics = await Message.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$lang',
          count: { $sum: 1 },
          aiResponses: {
            $sum: { $cond: [{ $eq: ['$isAIResponse', true] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalMessages = await Message.countDocuments({ userId });
    const totalAIResponses = await Message.countDocuments({ userId, isAIResponse: true });

    res.json({
      totalMessages,
      totalAIResponses,
      languageBreakdown: analytics,
      aiUsagePercentage: totalMessages > 0 ? ((totalAIResponses / totalMessages) * 100).toFixed(2) : 0
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, room = 'general' } = req.body;
    console.log('POST /messages received from chatController.js', { text, room });

    const userId = req.user.userId;

    //  Get the full user to extract username
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //  Create message with username from DB
    const newMessage = new Message({
      text,
      userId,
      username: user.username,
      room,
      lang:'en'
    });

    await newMessage.save();

    res.status(201).json({ message: 'Message stored successfully' });
  } catch (err) {
    console.error('Store chat error:', err);
    res.status(500).json({ message: 'Failed to send/store message' });
  }
};


// Get active users
const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.find({
      lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    }).select('username lastSeen');

    res.json({ activeUsers });
  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isAudio = file.mimetype.startsWith('audio/');
    const isDocument = file.mimetype.startsWith('application/') || file.mimetype.startsWith('text/');

    // Optionally: store in DB, generate file URL, etc.
    return res.status(200).json({
      fileId: file.filename,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileUrl: `/uploads/${file.filename}` // If serving static files
    });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ message: 'File upload failed' });
  }
};


module.exports = {
  getMessages,
  postMessages,
  fileupload,
  DownloadOp,
  detectLang,
  AIresp,
  translation,
  smartReply,
  Analytic,
  sendMessage,
  getActiveUsers,
  uploadFile
};