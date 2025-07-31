const jwt = require('jsonwebtoken');
const User = require('../models/User');


const salesAuth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "37b286bc7330b8877966625c5fff061cfb248cf0c01d1ba149046d1ba4d181a93aab590d1522e8ecd71aaaa0bc76aca04d84cdb62e34a84e2687c2201a045342");
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "sales") {
      return res.status(401).json({ message: "Not authorized as a user" });
    }

    req.user = {
      userId: user._id,
      username: user.username,
      role: user.role
    };

    next();
  } catch (err) {
    console.error("salesAuth error:", err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = {salesAuth};