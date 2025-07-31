const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  room: {
    type: String,
    default: 'general'
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  // File-related fields
  fileUrl: {
    type: String
  },
  fileType: {
    type: String
  },
  fileName: {
    type: String
  },
  duration: {
    type: Number // For audio/video files
  },
  // Edit tracking
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  // Sales support fields
  requestingSales: {
    type: Boolean,
    default: false
  },
  isSalesResponse: {
    type: Boolean,
    default: false
  },
  salesPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  handledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting'
  },
  // AI and language support
  isAIResponse: {
    type: Boolean,
    default: false
  },
  lang: {
    type: String,
    default: 'en'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  // Audio transcription
  audioTranscription: {
    type: String
  },
  transcriptionConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  // Priority and categorization
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  category: {
    type: String,
    enum: ['general', 'support', 'sales', 'technical', 'billing'],
    default: 'general'
  },
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    location: String,
    device: String
  },
  // Response time tracking
  responseTime: {
    type: Number // Time taken to respond in milliseconds
  },
  // Customer satisfaction
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ requestingSales: 1, createdAt: -1 });
messageSchema.index({ handledBy: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ salesPersonId: 1, createdAt: -1 });

// Virtual for message age
messageSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleString();
});

// Static method to find conversations requiring sales support
messageSchema.statics.findSalesRequests = function() {
  return this.aggregate([
    {
      $match: {
        requestingSales: true,
        handledBy: { $exists: false }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'customer'
      }
    },
    {
      $unwind: '$customer'
    },
    {
      $group: {
        _id: '$userId',
        lastMessage: { $last: '$text' },
        lastMessageTime: { $last: '$createdAt' },
        messageCount: { $sum: 1 },
        username: { $last: '$customer.username' },
        email: { $last: '$customer.email' },
        priority: { $max: '$priority' }
      }
    },
    {
      $sort: { lastMessageTime: -1 }
    }
  ]);
};

// Static method to get conversation stats
messageSchema.statics.getConversationStats = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.aggregate([
    {
      $facet: {
        totalConversations: [
          { $match: { requestingSales: true } },
          { $group: { _id: '$userId' } },
          { $count: 'count' }
        ],
        activeChats: [
          { 
            $match: { 
              requestingSales: true,
              handledBy: { $exists: true, $ne: null },
              completedAt: { $exists: false }
            } 
          },
          { $group: { _id: '$userId' } },
          { $count: 'count' }
        ],
        completedToday: [
          { 
            $match: { 
              requestingSales: true,
              completedAt: { $gte: today }
            } 
          },
          { $group: { _id: '$userId' } },
          { $count: 'count' }
        ],
        avgResponseTime: [
          {
            $match: {
              isSalesResponse: true,
              responseTime: { $exists: true, $gt: 0 }
            }
          },
          {
            $group: {
              _id: null,
              avgTime: { $avg: '$responseTime' }
            }
          }
        ]
      }
    }
  ]);
};

// Instance method to mark as handled
messageSchema.methods.markAsHandled = function(salesPersonId) {
  this.handledBy = salesPersonId;
  this.handledAt = new Date();
  this.status = 'active';
  return this.save();
};

// Instance method to complete conversation
messageSchema.methods.complete = function() {
  this.completedAt = new Date();
  this.status = 'completed';
  return this.save();
};

// Pre-save middleware to calculate response time
messageSchema.pre('save', async function(next) {
  if (this.isNew && this.isSalesResponse) {
    // Find the customer's last message
    const lastCustomerMessage = await this.constructor.findOne({
      userId: this.userId,
      isSalesResponse: { $ne: true },
      createdAt: { $lt: this.createdAt }
    }).sort({ createdAt: -1 });

    if (lastCustomerMessage) {
      this.responseTime = this.createdAt - lastCustomerMessage.createdAt;
    }
  }
  next();
});

// Pre-save middleware to set priority based on keywords
messageSchema.pre('save', function(next) {
  if (this.isNew && this.text && this.requestingSales) {
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'critical'];
    const highKeywords = ['important', 'priority', 'serious', 'problem'];
    
    const lowerText = this.text.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
      this.priority = 'urgent';
    } else if (highKeywords.some(keyword => lowerText.includes(keyword))) {
      this.priority = 'high';
    }
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);