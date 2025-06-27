// middleware/auth.js
const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  // logger.info("TOKEN " + token );
  if (!token) {
    logger.warn('Access denied: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    const user_db = await User.findOne({ where: { id: decoded.id } });
    req.user = user_db; // Gắn thông tin user vào req
    // console.log( user_db );
    // logger.debug(`User authenticated: ${decoded.email}`);
    next();
  } catch (err) {
    logger.error(`Invalid token: ${err.message}`);
    res.status(401).json({ message: 'Invalid token' });
  }
};