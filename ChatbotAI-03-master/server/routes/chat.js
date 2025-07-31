const express = require('express');
const { getMessages, getActiveUsers, postMessages, fileupload, DownloadOp, detectLang, translation, AIresp, smartReply, Analytic } = require('../controllers/chatController');
const {auth} = require('../middleware/auth.js');
const multer = require('multer');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET: Messages & Active Users

router.get('/messages', auth, getMessages);
router.get('/users/active', auth, getActiveUsers);


// POST: Store multilingual chat messages

router.post('/messages', auth, postMessages );

// POST: File Upload

router.post('/upload', auth, upload.single('file'), fileupload );

// GET: File Download

router.get('/download/:id', DownloadOp );

// POST: Detect Language

router.post('/detect-language', detectLang );

// POST: Translate Text

router.post('/translate', translation);

// POST: AI Chat Response

router.post('/ai-response', auth, AIresp);

// POST: Smart Replies

router.post('/smart-replies', auth, smartReply);

// GET: Analytics

router.get('/analytics', auth, Analytic);

module.exports = router;
