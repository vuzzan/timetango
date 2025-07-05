// controllers/userController.js
require('dotenv').config();

const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const utils = require('../utils/actionLog');
const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const Op = Sequelize.Op;

exports.getMe = async (req, res) => {
  const user = req.user;
  try {
    console.log("GET ME: " + req.method);
    if( req.method==="GET"){
      res.json(
        {
          "user": user
        });
    }
    else if( req.method==="POST"){
      // Update user
      console.log(req.ip);
      let data = req.body;
      console.log(data);
      let password = "";
      if( data.password1===data.password2){
        password = data.password1;
      }
      console.log(`password='${password}', ` );
      // var sql = "update users set "+
      //   "name='"+data.name+"', "+
      //   "notes='"+data.notes+"', "+
      //   (password.length>0?`password='${password}', `:"")+
      //   "updatedAt=CURRENT_TIMESTAMP() "+
      //   " where id='"+data.id+"'";
      // var listEvent = await sequelize.query(sql, {
      //     type: QueryTypes.UPDATE,
      // });
      // console.log(sql );

      const user = await User.findOne({ where: { id: data.id } });
      if (!user) {
        logger.warn(`User with email ${email} not found`);
      }

      //
      var message = "";
      if( password.length>0 ){
        message = "Update with password";
        //console.log("Update with password...");
        await user.update({
          name: data.name,
          notes: data.notes,
          password: password 
        });
      }
      else{
        message = "Update done";
        //console.log("NO update password...");
        await user.update({
          name: data.name,
          notes: data.notes,
        });
      }

      res.json(
        {
          "message": message,
          "user": await User.findByPk(data.id)
        });
    }
  } 
  catch (err) {
    res.status(200).json({ error: err.message });
  }
};
exports.getUsers = async (req, res) => {
  //console.log( req.body);
  const { groupid } = req.body;
  console.log( groupid);
  try {
    const users = await User.findAll({ 
      where: { 
        "group_id": groupid
      },
      attributes: ['id', 'name'],
    });
    res.json(users);
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  logger.info(`Login:  ${email} password ${password}`);
  // try {
  //   await sequelize.authenticate()
  // } catch (err) {
  //   console.error('Unable to connect to the database:', err)
  // }

  try {
    const user = await User.findOne({ 
      where: { 
        email: email
      }
      //, logging: console.log
    });
    logger.info(`Find user ok:  ${email} `);
    if (!user) {
      utils.log(req, `Login failed: User with email ${email} not found`);
      logger.info(`Login failed: User with email ${email} not found`);
      return res.status(200).json({ code: false, message: 'Invalid credentials' });
    }
    if (user.sts!=1) {
      utils.log(req, `Login failed: User with email ${email} is deactivated`);
      logger.info(`Login failed: User with email ${email} is deactivated`);
      return res.status(200).json({ code: false, message: 'User is deactivated' });
    }
    logger.info(`Login:  password ${password}`);
    // logger.info(`checkwith:  hashpassword ${user.password}`);
    const isMatch = await bcrypt.compare(password, user.password);
    // logger.info(`END compare Login:  password ${password}`);
    // const isMatch = hash1===hash2;
    if (!isMatch) {
      logger.info(`Login failed: Incorrect password for ${email}`);
      utils.log(req, `Login failed: Incorrect password for ${email}`);
      return res.status(200).json({ code: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    req.user = user;
    // console.log( user );
    var groupid = user.group_id;
    // if( user.group_id=="Tech"){
    //   func = "index";
    //   //window.location.href = '/home/'+response.func+"/"+response.groupid; 
    //   //app.get('/home/:function/:groupid', (req, res) => {
    // }
    // else if( user.group_id=="Neo"){
    //   func = "owner";
    // }
    // else if( user.group_id=="Owner"){
    //   func = "shop";
    // }
    // else if( user.group_id=="Manager"){
    //   func = "products";
    // }
    // else if( user.group_id=="Tech"){
    //   func = "index";
    // }
    // else if( user.group_id=="Acct"){
    //   func = "acct";
    // }
    // else if( user.group_id=="Customer"){
    //   func = "appointment";
    // }
    func = "me";
    logger.info(`${groupid} User ${email} logged in successfully111`);
    utils.log(req, `${groupid} User ${email} logged in successfully222`);
    res.json({ code: true, groupid: groupid, func: func, token: token});
  } catch (err) {
    //console.log( err );
    logger.error(`Login error: ${err.toString()}`);
    //console.log( err.toString() );
    //console.log( err.original.code );
    res.status(200).json({ code: false,  message: err.toString() });
  }
};

exports.logout = async (req, res) => {
  const user = req.user;

  try {
    logger.info(`User ${user.name} logout  in successfully`);
    req.user = user;
    utils.log(req, `User ${user.name} logged in successfully`);
    res.json({ code: true });
  } catch (err) {
    logger.error(`Logout error: ${err.message}`);
    res.status(200).json({ code: false,  message: err.message });
  }
};

exports.dtUsers = async (req, res) => {
  //console.log("exports.dtUsers");
  //console.log(req.user);
  //
  var datalist = [];
  var method = "list";
  if("save_method" in req.body){
    method = req.body.save_method;
  }
  try {
    if( method=="list"){
      const { SEARCH_ID, groupid, SEARCH_SHOP, SEARCH_GROUP } = req.body;
      var sql = "select id, name, sts, group_id, shop_id from users where id>0 ";

      if( parseInt(req.user.id) > 0 ){
        sql += "and owner_id='" + req.user.id +"'";
      }

      if( SEARCH_ID.length > 0 ){
        sql += "and name like '%" + utils.escape(SEARCH_ID) +"%'";
      }

      if( SEARCH_GROUP!=null && SEARCH_GROUP!=="" ){
        sql += "and LENGTH(group_id)>0 and group_id='" + utils.escape(SEARCH_GROUP) +"'";
      }

      if( SEARCH_SHOP!=null && parseInt(SEARCH_SHOP)>0 ){
        sql += "and shop_id='" + utils.escape(SEARCH_SHOP) +"'";
      }

      datalist = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      });
      var shoplist= await sequelize.query("select id, name from shops where owner_id=" + req.user.id, {
        type: QueryTypes.SELECT,
      });

      var grouplist = ["Manager", "Tech", "Acct"];
      
      res.json(
        {
          error: "",
          draw: req.body.draw,
          data: datalist,
          recordsTotal: datalist.length,
          recordsFiltered: datalist.length,
          shoplist: shoplist,
          grouplist: grouplist,
          sql: sql
        }
      );
    }
    else if( method=="view"){
      const viewObj = await User.findByPk(req.body.id);
      res.json(viewObj);
    }
    else if( method=="add"){
      let password = req.body.password1.length>0?req.body.password1:"abc123";

      const newObj = await User.create({ 
        name: req.body.name, 
        email: req.body.email, 
        password: password, 
        group_id: req.body.group_id, 
        owner_id: req.user.id, 
        shop_id: req.body.shop_id, 
      });
      res.json(
        {
          status: true,
          data: newObj,
        }
      );
      utils.log(req, "Add new Owner " + newObj.name);

    }
    else if( method=="update"){
      let newObj = await User.findByPk(req.body.id);
      newObj.name = req.body.name;
      newObj.email = req.body.email;
      newObj.sts = req.body.sts;
      if(req.body.password1.length>=2 && (req.body.password1===req.body.password2)){
        newObj.password = req.body.password1;
        logger.info("Update user + password: newObj.sts="+newObj.sts);
        utils.log(req, "Update user Info + password : " + newObj.name);
      }
      else{
        logger.info("Update user newObj.sts="+newObj.sts);
        utils.log(req, "Update user Info " + newObj.name);
      }
      
      await newObj.save();
      //utils.log(req, "Update user " + newObj.name);
      res.json(
        {
          status: true,
        }
      );
    }
    else if( method=="delete"){
      const newObj = await User.findByPk(req.body.id);
      newObj.sts  = 0;
      newObj.save();
      res.json(
        {
          status: true,
        }
      );

      utils.log(req, "Disabled [0] - Owner Info " + newObj.name);
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


exports.dtCustomers = async (req, res) => {
  //console.log("exports.dtUsers");
  //console.log(req.user);
  //
  var datalist = [];
  var method = "list";
  if("save_method" in req.body){
    method = req.body.save_method;
  }
  try {
    if( method=="list"){
      const { SEARCH_ID, groupid, SEARCH_SHOP, SEARCH_GROUP } = req.body;
      var sql = "select id, name, sts, group_id, shop_id from users where id>0 and group_id='Customer' ";

      if( parseInt(req.user.id) > 0 ){
        sql += "and owner_id='" + req.user.id +"'";
      }

      if( SEARCH_ID.length > 0 ){
        sql += "and name like '%" + utils.escape(SEARCH_ID) +"%'";
      }

      if( SEARCH_SHOP!=null && parseInt(SEARCH_SHOP)>0 ){
        sql += "and shop_id='" + utils.escape(SEARCH_SHOP) +"'";
      }

      datalist = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      });
      var shoplist= await sequelize.query("select id, name from shops where owner_id=" + req.user.id, {
        type: QueryTypes.SELECT,
      });

      var grouplist = ["Manager", "Tech", "Acct"];
      
      res.json(
        {
          error: "",
          draw: req.body.draw,
          data: datalist,
          recordsTotal: datalist.length,
          recordsFiltered: datalist.length,
          shoplist: shoplist,
          grouplist: grouplist,
          sql: sql
        }
      );
    }
    else if( method=="view"){
      const viewObj = await User.findByPk(req.body.id);
      res.json(viewObj);
    }
    else if( method=="add"){
      let password = req.body.password1.length>0?req.body.password1:"abc123";

      const newObj = await User.create({ 
        name: req.body.name, 
        email: req.body.email, 
        password: password, 
        group_id: "Customer", 
        owner_id: req.user.id, 
        shop_id: req.body.shop_id, 
      });
      res.json(
        {
          status: true,
          data: newObj,
        }
      );
      utils.log(req, "Add new Owner " + newObj.name);

    }
    else if( method=="update"){
      let newObj = await User.findByPk(req.body.id);
      newObj.name = req.body.name;
      newObj.email = req.body.email;
      newObj.sts = req.body.sts;
      if(req.body.password1.length>=2 && (req.body.password1===req.body.password2)){
        newObj.password = req.body.password1;
        logger.info("Update user + password: newObj.sts="+newObj.sts);
        utils.log(req, "Update user Info + password : " + newObj.name);
      }
      else{
        logger.info("Update user newObj.sts="+newObj.sts);
        utils.log(req, "Update user Info " + newObj.name);
      }
      try{
        await newObj.save();
        //utils.log(req, "Update user " + newObj.name);
        res.json(
          {
            status: true,
          }
        );
      }
      catch (error) {
        console.log( error );
        res.json(
          {
            status: false,
            error
          }
        );
      }
      
    }
    else if( method=="delete"){
      const newObj = await User.findByPk(req.body.id);
      newObj.sts  = 0;
      newObj.save();
      res.json(
        {
          status: true,
        }
      );

      utils.log(req, "Disabled [0] - Owner Info " + newObj.name);
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