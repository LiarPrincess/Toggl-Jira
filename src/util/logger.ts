import winston from "winston";
import path from "path";
import { default as moment } from "moment";

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      colorize: "all",
      showLevel: true,
      timestamp: true,
      prettyPrint: false,
      json: false,
    }),
      new winston.transports.File({
      filename: path.join("logs", `${moment().format("YYYY-MM-DD")}.log`),
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 10,
      prettyPrint: false,
      json: false,
    }),
  ],
  handleExceptions: true,
  exitOnError: true,
  level: "silly",
});

export default logger;
