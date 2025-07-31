const express = require('express');
const { body } = require('express-validator');
const { register, login, verifyToken, logout,registerSales,loginSales} = require('../controllers/authController');
const {auth} = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Register route
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/)
  .withMessage('Password must contain uppercase, lowercase, number, and special character'),

], register);


router.post('/sales/register', [
  body('username').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], registerSales);


router.post('/sales/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], loginSales);


// Login route
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .exists()
    .notEmpty()
    .withMessage('Password is required')
], login);


// Verify token route
router.get('/verify', auth, verifyToken);

// Logout route
router.post('/logout', auth, logout);


module.exports = router;