// utils/logger.js
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Ghi log ra console
    new transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
    }),
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-app.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Giữ log trong 14 ngày
    }),
    // File riêng cho lỗi
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-error.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
    }),
  ],
});

// Nếu không phải môi trường production, bật debug mode
if (process.env.NODE_ENV !== 'production') {
  // logger.add(
  //   new transports.Console({
  //     format: combine(
  //       colorize(),
  //       logFormat
  //     ),
  //     level: 'debug', // Hiển thị log cấp debug trong dev
  //   })
  // );
}

module.exports = logger;