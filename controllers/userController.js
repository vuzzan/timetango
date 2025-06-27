// controllers/userController.js
require('dotenv').config();

const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const actionlog = require('../utils/actionLog');
const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const sequelize = require('../config/database');


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

      // Cập nhật mật khẩu (hook beforeUpdate sẽ tự băm)
      if( password.length>0 ){
        console.log("Update with password...");
        await user.update({
          name: data.name,
          notes: data.notes,
          password: password 
        });
      }
      else{
        console.log("NO update password...");
        await user.update({
          name: data.name,
          notes: data.notes,
        });
      }

      res.json(
        {
          "user": await User.findByPk(data.id)
        });
    }
  } 
  catch (err) {
    res.status(200).json({ error: err.message });
  }
};
exports.getUsers = async (req, res) => {
  //logger.info( "get all Users");
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  logger.info(`Login:  ${email} password ${password}`);
  try {
    const user = await User.findOne({ 
      where: { 
        email: email
      }
      //, logging: console.log
    });
    //logger.info(`Login:  ${email} password ${password}`);
    if (!user) {
      actionlog.log(req, `Login failed: User with email ${email} not found`);
      logger.info(`Login failed: User with email ${email} not found`);
      return res.status(200).json({ code: false, message: 'Invalid credentials' });
    }
    if (user.sts!=1) {
      actionlog.log(req, `Login failed: User with email ${email} is deactivated`);
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
      actionlog.log(req, `Login failed: Incorrect password for ${email}`);
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
    actionlog.log(req, `${groupid} User ${email} logged in successfully222`);
    res.json({ code: true, groupid: groupid, func: func, token: token});
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(200).json({ code: false,  message: err.message });
  }
};

exports.logout = async (req, res) => {
  const user = req.user;

  try {
    logger.info(`User ${user.name} logout  in successfully`);
    req.user = user;
    actionlog.log(req, `User ${user.name} logged in successfully`);
    res.json({ code: true });
  } catch (err) {
    logger.error(`Logout error: ${err.message}`);
    res.status(200).json({ code: false,  message: err.message });
  }
};