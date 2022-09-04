const winston = require('winston');

const loggerDeveloping = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './utils/loggers/warn.log', level: 'warn' }),
        new winston.transports.File({ filename: './utils/loggers/error.log', level: 'error' })
    ]
});

const loggerProduction = winston.createLogger({
    level: 'warn',
    transports: [
        new winston.transports.File({ filename: './utils/loggers/warn.log', level: 'warn' }),
        new winston.transports.File({ filename: './utils/loggers/error.log', level: 'error' })
    ]
});

const logger = process.env.NODE_ENV === 'PROD' ? loggerProduction : loggerDeveloping;
logger.info(`process.env.NODE_ENV ${process.env.NODE_ENV}`);

module.exports = logger;