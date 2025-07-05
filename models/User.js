// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sts: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  shop_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  group_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  skill: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  rate: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

// Hook để băm password trước khi lưu
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});
// Hook để băm password trước khi cập nhật (nếu password thay đổi)
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    //logger.info( "beforeUpdate password "+user.password);
    user.password = await bcrypt.hash(user.password, 10);
    logger.info( "   ---afterUpdate password "+user.password);
  }
});
module.exports = User;