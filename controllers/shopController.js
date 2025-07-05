const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const moment = require('moment');
const Owner = require('../models/Owner');
const Shop = require('../models/Shop');
const sequelize = require('../config/database');
const logger = require('../utils/logger');
const utils = require('../utils/actionLog');
const User = require('../models/User');


exports.getDataOwner = async (req, res) => {
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

exports.getData = async (req, res) => {
  try {
    var listEvent = await Shop.findAll(
      {
        raw: false, 
      }
    );
    res.json(listEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.dtShops = async (req, res) => {
  console.log("exports.dtShops");
  //console.log(req.user);
  //
  var datalist = [];
  var method = "list";
  if("save_method" in req.body){
    method = req.body.save_method;
  }
  try {
    if( method=="list"){
      const { SEARCH_ID } = req.body;
      var sql = "select id, name, sts from shops where id>=0";
      if( SEARCH_ID.length > 0 ){
        sql += "and name like '%" + utils.escape(SEARCH_ID) +"%'";
      }
      datalist = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      });
      res.json(
        {
          error: "",
          draw: req.body.draw,
          data: datalist,
          recordsTotal: datalist.length,
          recordsFiltered: datalist.length,
          sql: ""
        }
      );
    }
    else if( method=="view"){
      let shop = await Shop.findByPk(req.body.id);
      const user = await User.findOne({
          where: { shop_id: shop.id },
          order: [ [ 'createdAt', 'DESC' ]],
          attributes: ['id', 'name', 'email', 'notes'],
      });
      res.json({
            shop,
            user
      });
    }
    else if( method=="add"){
      let shop = await Shop.create({
        owner_id: req.user.id, 
        name: req.body.name, 
        address: req.body.address, 
        phone: req.body.phone,
        sts: 1
      });
      utils.log(req, "Add new Shop " + shop.name +" OwnerId:"+shop.name+" OwnerName:" + req.user.name);
      //
      var user = await User.create({ 
        owner_id: req.user.id, 
        shop_id: shop.id,
        name: req.body.name, 
        email: req.body.email, 
        password: req.body.password1, 
        group_id: 'Manager',
        notes: req.body.notes,
        sts: 1
      });
      utils.log(req, "Add new Shop Manager user: " + user.name +" email:"+user.email);

      res.json(
        {
          status: true,
          data: {
            shop,
            user
          },
        }
      );
    }
    else if( method=="update"){
      let shop = await Shop.findByPk(req.body.id);
      shop.name = req.body.name;
      shop.address = req.body.address;
      shop.phone = req.body.phone;
      shop.sts = req.body.sts;
      logger.info("Update shop newObj.sts="+shop.sts);
      await shop.save();

      let user = await User.findOne({
          where: { shop_id: shop.id }
      });
      user.name = req.body.name;
      user.email = req.body.email;
      user.notes = req.body.notes;
      logger.info("Update user user.email="+user.email);
      await user.save();
      res.json(
        {
          status: true,
        }
      );
      utils.log(req, "Update Shop Info " + newObj.name);
    }
    else if( method=="delete"){
      let shop = await Shop.findByPk(req.body.id);
      shop.sts = 0;
      logger.info("Delete shop sts="+shop.sts);
      await shop.save();

      let user = await User.findOne({
          where: { shop_id: shop.id }
      });
      user.sts = 0;
      logger.info("Delete user by shop "+shop.name+". user.email="+user.email);
      await user.save();
      res.json(
        {
          status: true,
        }
      );
    }
    
  } catch (err) {
    res.status(200).json({
        status: false,
        error: err.message,
        draw: req.body.draw,
        data: datalist,
        recordsTotal: datalist.length,
				recordsFiltered: datalist.length,
        sql: ""
      });
  }
};