const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const allowedMimeTypes = [
  // Documents
  'application/pdf',
  'application/vnd.ms-excel',                               
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
  'text/csv',
  'application/vnd.ms-powerpoint',                          
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
  'application/msword',                                     
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 

  // Images
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',

  // Media
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/x-matroska',
  'video/x-msvideo',
  'video/quicktime'
];

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb+srv://manthrabecse22:buC8zCePHYEF979K@cluster0.ttdqch5.mongodb.net/livechat?retryWrites=true&w=majority&appName=Cluster0',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
   return new Promise((resolve, reject) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return reject(new Error('Invalid file type'));
      }

      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = `${buf.toString('hex')}${path.extname(file.originalname)}`;
        resolve({ filename, bucketName: 'uploads' });
      });
    });
  }
});

// Attach limits and filter
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },      // Max size = 10MB
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

module.exports = upload;
