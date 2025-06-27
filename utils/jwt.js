// utils/jwt.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id, 
      // owner_id: user.owner_id, 
      // shop_id: user.shop_id, 
      // name: user.name, 
      email: user.email,
    }, 
    // Payload: thông tin user muốn lưu trong token
    process.env.JWT_SECRET,
    {
      expiresIn: '1h' 
    } // Token hết hạn sau 1 giờ
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };