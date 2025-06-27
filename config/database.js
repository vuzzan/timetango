 const { Sequelize } = require('sequelize');
    const db = new Sequelize(
        process.env.DB_NAME?process.env.DB_NAME:"timetango",
        process.env.DB_USER?process.env.DB_USER:"root",
        process.env.DB_PASSWORD?process.env.DB_PASSWORD:"okokokok",{
        host: process.env.DB_HOST,
        dialect: "mysql",
        charset: 'utf8mb4', // Đặt character set mặc định
        //operatorsAliases: false,
        pool: {
            max: 5,
            min: 0,
            acquire:30000,
            idle:10000
        }
    })
    
    // I deleted what was causing the problem

    module.exports = db;


// config/database.js
// const mysql = require('mysql2');
// require('dotenv').config();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected to MySQL');
// });

// module.exports = connection;