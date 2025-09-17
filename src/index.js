const { Client, GatewayIntentBits } = require('discord.js');
const CommandHandler = require('./handlers/commandHandler');
const EventHandler = require('./handlers/eventHandler');
const Scheduler = require('./schedulers/scheduler');
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
        console.error('Error during bot initialization:', error);
        process.exit(1);
    }
}

init();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    if (client.scheduler) {
        client.scheduler.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    if (client.scheduler) {
        client.scheduler.stop();
    }
    process.exit(0);
});
