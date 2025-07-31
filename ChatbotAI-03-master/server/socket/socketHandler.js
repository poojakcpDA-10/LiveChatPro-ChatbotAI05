const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const connectedUsers = new Map();
const connectedSalesPersons = new Map();
const conversationOwnership = new Map(); // Track which salesperson owns which conversation

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || '3c741a4933346a3d69963260bac0619c5f12cb3525daf5d10d6ea34c58980eaf17afe22a3d604777e78c2de2e8a7fe759eb3b2322d50f3aba71bcffa9dedc170');
      
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} (${socket.user.role}) connected`);

    // Store user connection based on role
    if (socket.user.role === 'sales') {
      connectedSalesPersons.set(socket.user._id.toString(), {
        socketId: socket.id,
        username: socket.user.username,
        userId: socket.user._id,
        isAvailable: true,
        socket: socket
      });
      
      // Join sales room
      socket.join('sales-room');
      
      // Notify about available salespersons
      io.emit('salesPersonsUpdate', Array.from(connectedSalesPersons.values()).map(sp => ({
        socketId: sp.socketId,
        username: sp.username,
        userId: sp.userId,
        isAvailable: sp.isAvailable
      })));
    } else {
      // Customer connection
      const customerId = socket.user._id.toString();
      connectedUsers.set(customerId, {
        socketId: socket.id,
        username: socket.user.username,
        userId: socket.user._id,
        socket: socket
      });
      
      // Join customer to their own room
      socket.join(`customer-${customerId}`);
    }

    // Join user to general room
    socket.join('general');

    // Broadcast updated user list
    const activeUsers = Array.from(connectedUsers.values()).map(user => ({
      socketId: user.socketId,
      username: user.username,
      userId: user.userId
    }));
    io.emit('activeUsers', activeUsers);

    // Handle customer requesting sales support
    socket.on('requestSalesSupport', async (data) => {
      try {
        const { message } = data;
        const customerId = socket.user._id.toString();
        
        // Create message indicating sales request
        const salesRequestMessage = new Message({
          text: message || 'Customer requesting sales support',
          userId: socket.user._id,
          username: socket.user.username,
          room: 'general',
          requestingSales: true
        });

        await salesRequestMessage.save();

        // Notify all connected salespersons with customer details
        const customer = await User.findById(socket.user._id).select('username email');
        socket.broadcast.to('sales-room').emit('newSalesRequest', {
          customerId: customerId,
          customerName: socket.user.username,
          customerEmail: customer.email,
          message: message,
          timestamp: new Date(),
          status: 'waiting'
        });

        // Confirm to customer
        socket.emit('salesRequestSent', { 
          message: 'Your request has been sent to our sales team. A representative will be with you shortly.' 
        });

        // Update stats for all sales dashboards
        updateSalesStats(io);

      } catch (error) {
        console.error('Sales request error:', error);
        socket.emit('error', { message: 'Failed to request sales support' });
      }
    });

    // Handle salesperson claiming a conversation
    socket.on('claimConversation', async (data) => {
      const { customerId } = data;
      const salespersonId = socket.user._id.toString();
      
      if (socket.user.role !== 'sales') {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Check if conversation is already claimed
      if (conversationOwnership.has(customerId)) {
        const owner = conversationOwnership.get(customerId);
        if (owner.salespersonId !== salespersonId) {
          socket.emit('conversationAlreadyClaimed', {
            message: `This conversation is already handled by ${owner.salespersonName}`
          });
          return;
        }
      }

      try {
        // Claim the conversation
        conversationOwnership.set(customerId, {
          salespersonId: salespersonId,
          salespersonName: socket.user.username,
          claimedAt: new Date()
        });

        // Join customer-specific room
        const roomName = `customer-${customerId}`;
        socket.join(roomName);

        // Update availability
        const salesPerson = connectedSalesPersons.get(salespersonId);
        if (salesPerson) {
          salesPerson.isAvailable = false;
          connectedSalesPersons.set(salespersonId, salesPerson);
        }

        // Notify customer that sales rep joined
        const customerSocket = connectedUsers.get(customerId);
        if (customerSocket) {
          io.to(`customer-${customerId}`).emit('salesRepJoined', {
            salesRepName: socket.user.username,
            salesRepId: salespersonId,
            message: `${socket.user.username} from sales team has joined the conversation.`
          });
        }

        // Notify other sales reps that this conversation is taken
        socket.broadcast.to('sales-room').emit('conversationClaimed', {
          customerId: customerId,
          claimedBy: socket.user.username
        });

        // Confirm to claiming salesperson
        socket.emit('conversationClaimed', {
          customerId: customerId,
          customerName: customerSocket?.username || 'Customer',
          success: true
        });

        // Update stats
        updateSalesStats(io);

      } catch (error) {
        console.error('Claim conversation error:', error);
        socket.emit('error', { message: 'Failed to claim conversation' });
      }
    });

    // Handle sales message to specific customer
    socket.on('salesMessage', async (data) => {
      try {
        const { customerId, text } = data;
        const salespersonId = socket.user._id.toString();
        
        if (socket.user.role !== 'sales') {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Verify ownership
        const ownership = conversationOwnership.get(customerId);
        if (!ownership || ownership.salespersonId !== salespersonId) {
          socket.emit('error', { message: 'You are not assigned to this conversation' });
          return;
        }

        // Save message to database
        const message = new Message({
          text,
          userId: customerId, // Message belongs to customer's thread
          username: `Sales Rep (${socket.user.username})`,
          room: 'general',
          isSalesResponse: true,
          salesPersonId: socket.user._id
        });

        await message.save();

        const messageData = {
          id: message._id,
          text: message.text,
          userId: message.userId,
          username: message.username,
          timestamp: message.createdAt,
          room: message.room,
          isSalesResponse: true,
          salesPersonId: socket.user._id
        };

        // Send ONLY to the specific customer
        io.to(`customer-${customerId}`).emit('message', messageData);

        // Confirm to salesperson
        socket.emit('messageSent', { 
          messageId: message._id,
          customerId: customerId 
        });

      } catch (error) {
        console.error('Sales message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle customer messages (when in sales mode)
    socket.on('customerMessage', async (data) => {
      try {
        const { text, room = 'general' } = data;
        const customerId = socket.user._id.toString();
        
        // Save message to database
        const message = new Message({
          text,
          userId: socket.user._id,
          username: socket.user.username,
          room
        });

        await message.save();

        const messageData = {
          id: message._id,
          text: message.text,
          userId: message.userId,
          username: message.username,
          timestamp: message.createdAt,
          room: message.room
        };

        // Send to assigned salesperson if conversation is claimed
        const ownership = conversationOwnership.get(customerId);
        if (ownership) {
          const salesPerson = connectedSalesPersons.get(ownership.salespersonId);
          if (salesPerson) {
            salesPerson.socket.emit('customerMessage', {
              ...messageData,
              customerId: customerId
            });
          }
        }

        // Echo back to customer
        socket.emit('message', messageData);

      } catch (error) {
        console.error('Customer message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle regular messages (existing functionality)
    socket.on('message', async (data) => {
      try {
        const { text, room = 'general' } = data;
        
        // Save message to database
        const message = new Message({
          text,
          userId: socket.user._id,
          username: socket.user.username,
          room
        });

        await message.save();

        const fullMessage = {
          id: message._id,
          text: message.text,
          userId: message.userId,
          username: message.username,
          timestamp: message.createdAt,
          room: message.room
        };

        socket.emit('message', fullMessage);
        socket.broadcast.to(room).emit('message', fullMessage);

      } catch (error) {
        console.error('Message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators for sales
    socket.on('salesTyping', (data) => {
      const { customerId } = data;
      if (socket.user.role === 'sales') {
        io.to(`customer-${customerId}`).emit('salesTyping', {
          salesRepName: socket.user.username
        });
      }
    });

    socket.on('salesStopTyping', (data) => {
      const { customerId } = data;
      if (socket.user.role === 'sales') {
        io.to(`customer-${customerId}`).emit('salesStopTyping', {
          salesRepName: socket.user.username
        });
      }
    });

    // Handle customer typing to sales
    socket.on('customerTyping', () => {
      const customerId = socket.user._id.toString();
      const ownership = conversationOwnership.get(customerId);
      if (ownership) {
        const salesPerson = connectedSalesPersons.get(ownership.salespersonId);
        if (salesPerson) {
          salesPerson.socket.emit('customerTyping', {
            customerId: customerId,
            customerName: socket.user.username
          });
        }
      }
    });

    socket.on('customerStopTyping', () => {
      const customerId = socket.user._id.toString();
      const ownership = conversationOwnership.get(customerId);
      if (ownership) {
        const salesPerson = connectedSalesPersons.get(ownership.salespersonId);
        if (salesPerson) {
          salesPerson.socket.emit('customerStopTyping', {
            customerId: customerId,
            customerName: socket.user.username
          });
        }
      }
    });

    // Handle conversation completion
    socket.on('completeConversation', async (data) => {
      const { customerId } = data;
      const salespersonId = socket.user._id.toString();
      
      if (socket.user.role !== 'sales') {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      try {
        // Mark messages as handled
        await Message.updateMany(
          { userId: customerId, requestingSales: true },
          { $set: { handledBy: socket.user._id, handledAt: new Date() } }
        );

        // Remove ownership
        conversationOwnership.delete(customerId);

        // Update availability
        const salesPerson = connectedSalesPersons.get(salespersonId);
        if (salesPerson) {
          salesPerson.isAvailable = true;
          connectedSalesPersons.set(salespersonId, salesPerson);
        }

        // Leave customer room
        socket.leave(`customer-${customerId}`);

        // Notify customer
        io.to(`customer-${customerId}`).emit('conversationCompleted', {
          message: 'This conversation has been completed. Thank you for contacting us!'
        });

        // Confirm to salesperson
        socket.emit('conversationCompleted', {
          customerId: customerId,
          success: true
        });

        // Update stats
        updateSalesStats(io);

      } catch (error) {
        console.error('Complete conversation error:', error);
        socket.emit('error', { message: 'Failed to complete conversation' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      const userId = socket.user._id.toString();
      
      // Remove user from appropriate map
      if (socket.user.role === 'sales') {
        // Release any claimed conversations
        for (const [customerId, ownership] of conversationOwnership.entries()) {
          if (ownership.salespersonId === userId) {
            conversationOwnership.delete(customerId);
            // Notify customer that sales rep disconnected
            io.to(`customer-${customerId}`).emit('salesRepDisconnected', {
              message: 'Sales representative has disconnected. You may be transferred to another representative.'
            });
          }
        }
        
        connectedSalesPersons.delete(userId);
        io.emit('salesPersonsUpdate', Array.from(connectedSalesPersons.values()).map(sp => ({
          socketId: sp.socketId,
          username: sp.username,
          userId: sp.userId,
          isAvailable: sp.isAvailable
        })));
      } else {
        connectedUsers.delete(userId);
      }
      
      // Update user's last seen
      User.findByIdAndUpdate(socket.user._id, { lastSeen: new Date() }).exec();
      
      // Broadcast updated user list
      const activeUsers = Array.from(connectedUsers.values()).map(user => ({
        socketId: user.socketId,
        username: user.username,
        userId: user.userId
      }));
      io.emit('activeUsers', activeUsers);

      // Update stats
      updateSalesStats(io);
    });
  });
};

// Helper function to update sales statistics
const updateSalesStats = async (io) => {
  try {
    const totalConversations = await Message.distinct('userId', { requestingSales: true }).length;
    const activeChats = conversationOwnership.size;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = await Message.countDocuments({
      handledAt: { $gte: today },
      requestingSales: true
    });

    // Calculate average response time (simplified)
    const avgResponseTime = 2.5; // This would need more complex calculation

    const stats = {
      totalConversations,
      activeChats,
      completedToday,
      avgResponseTime
    };

    io.to('sales-room').emit('statsUpdate', stats);
  } catch (error) {
    console.error('Error updating stats:', error);
  }
};

module.exports = {socketHandler};