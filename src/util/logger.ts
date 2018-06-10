import winston from "winston";
import { Logger } from "winston";

const logger = new (Logger)({
    transports: [
        new (winston.transports.Console)({ level: "debug" }),
    ],
});

export default logger;
