const express = require('express');
const { conversation, conversationHist, claimConversation, postMessages, completedConver, statistics, unclaimedConver } = require('../controllers/salesController');
const {salesAuth} = require('../middleware/salesAuth');
const router = express.Router();


// Apply salesAuth middleware to all routes
router.use(salesAuth);

// Get all active customer conversations
router.get('/conversations', conversation );

// Get conversation history with a specific customer
router.get('/conversation/:customerId', conversationHist );

// Claim a conversation
router.post('/conversation/:customerId/claim', claimConversation );

// Send message to customer
router.post('/message', postMessages );

// Mark conversation as handled/completed
router.post('/conversation/:customerId/complete', completedConver);

// Get sales statistics
router.get('/stats', statistics);

// Get unclaimed conversations (for dashboard notifications)
router.get('/unclaimed', salesAuth, unclaimedConver );

module.exports = router;