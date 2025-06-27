const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const moment = require('moment');
const Event = require('../models/Event');
const User = require('../models/User');
const sequelize = require('../config/database');
const logger = require('../utils/logger');
const actionlog = require('../utils/actionLog');

exports.postEvents = async (req, res) => {
  // Access the JSON data from req.body
  const data = req.body;
  //logger.debug('Received data:', data);
  // Update data
  var sql = "update events set "+
    "start_time=FROM_UNIXTIME("+data.start+"),"+
    "end_time=FROM_UNIXTIME("+data.end+"),"+
    "resource='"+data.resource+"', "+
    "category='"+data.category+"', "+
    "content='"+data.content+"', "+
    "title='"+data.title+"', "+
    "updatedAt=CURRENT_TIMESTAMP() "+
    " where id='"+data.id+"'";
  var listEvent = await sequelize.query(sql, {
      type: QueryTypes.UPDATE,
  });

  actionlog.log(req, "Update event " + data.title);

  sql = "select *, UNIX_TIMESTAMP(start_time) as start, UNIX_TIMESTAMP(end_time) as end from events where id="+data.id;
  res.json({
    message: 'Data received successfully!',
    data: await sequelize.query(sql, {
        type: QueryTypes.QUERY,
        plain: true,
    })
  });
}
exports.getEvents = async (req, res) => {
  //logger.info( "get all Event ");
  try {
    var listEvent = await Event.findAll(
      {
        attributes: {
          include: [
            [Sequelize.literal("UNIX_TIMESTAMP(start_time)"), 'start'],
            [Sequelize.literal("UNIX_TIMESTAMP(end_time)"), 'end'],
          ],
        },
        raw: false, 
      }
    );
    res.json(listEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};