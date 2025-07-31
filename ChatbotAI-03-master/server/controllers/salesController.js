const Message = require("../models/Message.js");
const mongoose = require('mongoose');
const User = require("../models/User.js");


const conversation = async (req, res) => {
  try {
    // Get conversations where customers requested human support
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { text: { $regex: /human|support|salesperson|representative/i } },
            { requestingSales: true }
          ]
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
          isHandled: { $last: { $ifNull: ['$handledBy', false] } },
          handledBy: { $last: '$handledBy' },
          handledAt: { $last: '$handledAt' },
          salesPersonId: { $last: '$salesPersonId' },
          status: { $last: '$status' }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    // Filter out completed conversations unless specifically requested
    const activeConversations = conversations.filter(conv => conv.status !== 'completed');

    res.json({ conversations: activeConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const conversationHist = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Validate customerId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Get messages for this specific customer only
    const messages = await Message.find({ 
      userId: new mongoose.Types.ObjectId(customerId)
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    const customer = await User.findById(customerId).select('username email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({ messages, customer });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const claimConversation = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Check if conversation is already claimed
    const existingClaim = await Message.findOne({
      userId: new mongoose.Types.ObjectId(customerId),
      requestingSales: true,
      handledBy: { $exists: true, $ne: null }
    });

    if (existingClaim && existingClaim.handledBy.toString() !== req.user.userId.toString()) {
      const claimingUser = await User.findById(existingClaim.handledBy).select('username');
      return res.status(409).json({ 
        message: `Conversation already claimed by ${claimingUser?.username || 'another salesperson'}`,
        alreadyClaimed: true 
      });
    }

    // Claim the conversation
    await Message.updateMany(
      { 
        userId: new mongoose.Types.ObjectId(customerId), 
        requestingSales: true,
        handledBy: { $exists: false }
      },
      { 
        $set: { 
          handledBy: req.user.userId,
          handledAt: new Date(),
          status: 'active'
        } 
      }
    );

    const customer = await User.findById(customerId).select('username email');

    res.json({ 
      message: 'Conversation claimed successfully',
      customer: customer,
      claimedBy: req.user.username
    });
  } catch (error) {
    console.error('Claim conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const postMessages = async (req, res) => {
  try {
    const { customerId, text } = req.body;
    
    if (!customerId || !text) {
      return res.status(400).json({ message: 'Customer ID and message text are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Verify the salesperson has claimed this conversation
    const claimedConversation = await Message.findOne({
      userId: new mongoose.Types.ObjectId(customerId),
      requestingSales: true,
      handledBy: req.user.userId
    });

    if (!claimedConversation) {
      return res.status(403).json({ 
        message: 'You must claim this conversation first' 
      });
    }
    
    const message = new Message({
      text,
      userId: new mongoose.Types.ObjectId(customerId),
      username: `Sales Rep (${req.user.username})`,
      room: 'general',
      isSalesResponse: true,
      salesPersonId: req.user.userId
    });

    await message.save();

    res.json({ 
      message: 'Message sent successfully', 
      messageId: message._id,
      customerId: customerId
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const completedConver = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Verify the salesperson owns this conversation
    const ownedConversation = await Message.findOne({
      userId: new mongoose.Types.ObjectId(customerId),
      requestingSales: true,
      handledBy: req.user.userId
    });

    if (!ownedConversation) {
      return res.status(403).json({ 
        message: 'You can only complete conversations you have claimed' 
      });
    }
    
    // Mark all related messages as completed
    const result = await Message.updateMany(
      { 
        userId: new mongoose.Types.ObjectId(customerId), 
        requestingSales: true,
        handledBy: req.user.userId
      },
      { 
        $set: { 
          completedAt: new Date(),
          status: 'completed'
        } 
      }
    );

    res.json({ 
      message: 'Conversation marked as complete',
      updatedMessages: result.modifiedCount
    });
  } catch (error) {
    console.error('Complete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const statistics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total conversations requesting sales
    const totalConversations = await Message.distinct('userId', { 
      requestingSales: true 
    });

    // Active chats (claimed but not completed)
    const activeChats = await Message.distinct('userId', {
      requestingSales: true,
      handledBy: { $exists: true, $ne: null },
      completedAt: { $exists: false }
    });

    // Completed today
    const completedToday = await Message.distinct('userId', {
      requestingSales: true,
      completedAt: { $gte: today, $lt: tomorrow }
    });

    // Calculate average response time (simplified calculation)
    const responseTimeData = await Message.aggregate([
      {
        $match: {
          isSalesResponse: true,
          createdAt: { $gte: today },
          responseTime: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const avgResponseTime = responseTimeData.length > 0 
      ? Math.round(responseTimeData[0].avgTime / (1000 * 60)) // Convert to minutes
      : 0;

    const stats = {
      totalConversations: totalConversations.length,
      activeChats: activeChats.length,
      completedToday: completedToday.length,
      avgResponseTime: avgResponseTime
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      message: 'Server error',
      stats: {
        totalConversations: 0,
        activeChats: 0,
        completedToday: 0,
        avgResponseTime: 0
      }
    });
  }
};

const unclaimedConver = async (req, res) => {
  try {
    const unclaimedConversations = await Message.aggregate([
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
          username: { $last: '$customer.username' },
          email: { $last: '$customer.email' }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json({ unclaimed: unclaimedConversations });
  } catch (error) {
    console.error('Get unclaimed conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
    conversation,
    conversationHist,
    claimConversation,
    postMessages,
    completedConver,
    statistics,
    unclaimedConver
}