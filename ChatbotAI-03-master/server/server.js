const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const { connectGridFS } = require('./config/gridFs');
const authRoutes = require('./routes/auth.js');
const chatRoutes = require('./routes/chat.js');
const salesRoutes = require('./routes/sales.js');
const {socketHandler} = require('./socket/socketHandler.js');

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
}));

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB().then(() => {
  const conn = mongoose.connection;
  connectGridFS(conn);
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes); 
app.use('/api/chat', chatRoutes);
app.use('/uploads', express.static('uploads'));

socketHandler(io);

app.use('/api/sales', salesRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
app.get('/test', (req, res) => {
  res.json({ message: "API is working" });
});


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});