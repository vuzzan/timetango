// controllers/userController.js
const moment = require('moment');
const Event = require('../models/Event');
const User = require('../models/User');
const Product = require('../models/Product');
const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const logger = require('../utils/logger');
const actionlog = require('../utils/actionLog');

exports.getEvents = async (req, res) => {
  const user = req.user;

  var dt = moment().format("yyyy-MM-DD");
  if( "dt" in req.query ){
    dt = req.query.dt;
  }
  actionlog.log(req, `Get data - Date=${dt}` );
  try {
    sql = "SELECT t.*, UNIX_TIMESTAMP(start_time) as start, UNIX_TIMESTAMP(end_time) as end "+
          "FROM `events` as t "+
          " where t.sts=1 and "+
          " t.start_time>='"+dt+"' "+
          " and owner_id="+user.owner_id+
          " and shop_id="+user.shop_id;
    var listEvent = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    sql = "SELECT * "+
          "FROM `users` as t "+
          " where t.sts=1 "+
          " and owner_id="+user.owner_id+
          " and shop_id="+user.shop_id;

    var listResource = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    sql = "SELECT * "+
          "FROM `products` as t "+
          " where t.sts=1 "+
          " and owner_id="+user.owner_id+
          " and shop_id="+user.shop_id;

    var listProducts = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    res.json(
      {"products":listProducts, 
        "events":listEvent, 
        "resources":listResource,
        "user": user
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};