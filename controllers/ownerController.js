const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const moment = require('moment');
const Owner = require('../models/Owner');
const sequelize = require('../config/database');
const logger = require('../utils/logger');
const actionlog = require('../utils/actionLog');

exports.getData = async (req, res) => {
  try {
    var listEvent = await Owner.findAll(
      {
        raw: false, 
      }
    );
    res.json(listEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};