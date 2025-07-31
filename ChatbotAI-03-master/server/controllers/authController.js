const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || '3c741a4933346a3d69963260bac0619c5f12cb3525daf5d10d6ea34c58980eaf17afe22a3d604777e78c2de2e8a7fe759eb3b2322d50f3aba71bcffa9dedc170', {
    expiresIn: '7d'
  });
};

// Register user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (user.role !== 'user') {
      return res.status(401).json({ message: 'Not authorized as a user' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,               
        
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,  
        language: user.language || 'en'
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




const registerSales = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password,
      role: 'sales' 
    });

    await user.save();
    res.status(201).json({ message: 'Salesperson registered successfully' });
  } catch (err) {
    console.error('Register sales error:', err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
};
const loginSales = async (req, res) => {
  try {
    const { email, password } = req.body;
  const salesperson = await User.findOne({ email });

  if (!salesperson || salesperson.role !== 'sales') {
    return res.status(403).json({ message: 'Not authorized as a salesperson' });
  }

  const isMatch = await salesperson.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(salesperson._id);
  res.json({
    message: 'Login successful',
    user: {
      id: salesperson._id,
      username: salesperson.username,
      email: salesperson.email,
      role: salesperson.role
    },
    token
    });
  } catch (error) {
    console.error('Sales login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  logout,
  registerSales,
  loginSales
};

