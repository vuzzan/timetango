// scripts/updatePasswords.js
const sequelize = require('../config/database');
const User = require('../models/User');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

const updatePasswords = async () => {
  try {
    await sequelize.sync({ force: false }); // Đảm bảo bảng tồn tại

    const usersToUpdate = [
      { email: 'neo@gmail.com', newPassword: 'abc123' },
      // Thêm các user khác nếu cần
    ];

    for (const { email, newPassword } of usersToUpdate) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        logger.warn(`User with email ${email} not found`);
        continue;
      }

      // Cập nhật mật khẩu (hook beforeUpdate sẽ tự băm)
      await user.update({ password: newPassword });
      logger.info(`Updated password for user: ${email}`);
    }

    logger.info('Password update completed');
    process.exit(0);
  } catch (err) {
    logger.error(`Error updating passwords: ${err.message}`);
    process.exit(1);
  }
};

updatePasswords();