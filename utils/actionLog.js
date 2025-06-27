const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

const log = async (req, action) => {
  var user = req.user;
  // console.log( "Action log ") ;
  // console.log( "Action log " + user["owner_id"]) ;
  var owner_id = user?user.owner_id:0;
  var shop_id = user?user.shop_id:0;
  var user_id = user?user.id:0;
  var user_name = user?user.name:"";
  // console.log( "Action log ") ;
  // console.log( user) ;

  var sql = "insert into action_log(owner_id, shop_id, user_id, user_name, action) values ("+
    "'"+owner_id+"' "+
    ", '"+shop_id+"' "+
    ", '"+user_id+"' "+
    ", '"+user_name+"' "+
    ", '"+action+"' "+
    ")";
  var listEvent = await sequelize.query(sql, {
      type: QueryTypes.INSERT,
  });
};

module.exports = { log };