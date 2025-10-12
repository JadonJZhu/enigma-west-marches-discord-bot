const { Client, GatewayIntentBits } = require('discord.js');
const CommandHandler = require('./handlers/commandHandler');
const EventHandler = require('./handlers/eventHandler');
const Scheduler = require('./schedulers/scheduler');
const logger = require('./utils/logger');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Initialize handlers
client.commandHandler = new CommandHandler(client);
client.eventHandler = new EventHandler(client);
client.scheduler = new Scheduler(client);

// Initialize the bot
async function init() {
    try {
        // Load commands
        await client.commandHandler.loadCommands();

        // Load events
        await client.eventHandler.loadEvents();

        // Login with bot token
        await client.login(process.env.TOKEN);

        // Start scheduler after successful login
        client.scheduler.start();

    } catch (error) {
        logger.error('Error during bot initialization', { error: error.message, stack: error.stack });
        process.exit(1);
    }
}

// Global error handlers for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    // Give logger time to write before exiting
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: promise.toString()
    });
    // Don't exit on unhandled rejections in production, just log them
});

init();

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    if (client.scheduler) {
        client.scheduler.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    if (client.scheduler) {
        client.scheduler.stop();
    }
    process.exit(0);
});
