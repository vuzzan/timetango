// config/env.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  dbHost: process.env.DB_HOST,
  // ...
};