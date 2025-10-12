const winston = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

// Define log directory
const LOG_DIR = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        // Add metadata if present
        if (Object.keys(meta).length > 0) {
            log += ` | ${JSON.stringify(meta)}`;
        }

        // Add stack trace for errors
        if (stack) {
            log += `\n${stack}`;
        }

        return log;
    })
);

// Error log transport (rotates daily, keeps 30 days)
const errorTransport = new DailyRotateFile({
    filename: path.join(LOG_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: logFormat
});

// Combined log transport (rotates daily, keeps 14 days)
const combinedTransport = new DailyRotateFile({
    filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
});

// Console transport for development
const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    )
});

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        errorTransport,
        combinedTransport,
        consoleTransport
    ],
    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'exceptions.log'),
            format: logFormat
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'rejections.log'),
            format: logFormat
        })
    ]
});

// Add method to log Discord.js errors with context
logger.discordError = (error, context = {}) => {
    logger.error('Discord.js Error', {
        error: error.message,
        stack: error.stack,
        ...context
    });
};

// Add method to log command executions
logger.commandExecuted = (commandName, userId, guildId, success = true, error = null) => {
    const logData = {
        command: commandName,
        userId,
        guildId,
        success
    };

    if (error) {
        logData.error = error.message;
        logger.warn('Command execution failed', logData);
    } else {
        logger.info('Command executed successfully', logData);
    }
};

// Add method to log scheduler events
logger.schedulerEvent = (eventType, details = {}) => {
    logger.info('Scheduler event', {
        eventType,
        ...details
    });
};

module.exports = logger;
