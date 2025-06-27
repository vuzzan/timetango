// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Owner = sequelize.define('owner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sts: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Owner;