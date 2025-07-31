const jwt = require('jsonwebtoken');
const User = require('../models/User');

// General authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '3c741a4933346a3d69963260bac0619c5f12cb3525daf5d10d6ea34c58980eaf17afe22a3d604777e78c2de2e8a7fe759eb3b2322d50f3aba71bcffa9dedc170');

    const user = await User.findById(decoded.userId || decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user; // Attach full user object including role
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};



module.exports = {auth} ;
