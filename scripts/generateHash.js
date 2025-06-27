// scripts/generateHash.js
const bcrypt = require('bcrypt');

const generateHash = async (password) => {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Hashed password ${password}:`, hash);
  } catch (err) {
    console.error('Error generating hash:', err.message);
  }
};

// Thay 'password123' bằng mật khẩu bạn muốn băm
generateHash('abc123');