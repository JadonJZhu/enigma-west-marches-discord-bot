const { Client, GatewayIntentBits } = require('discord.js');
const CommandHandler = require('./handlers/commandHandler');
const EventHandler = require('./handlers/eventHandler');
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

// Initialize the bot
async function init() {
    try {
        // Load commands
        await client.commandHandler.loadCommands();

        // Load events
        await client.eventHandler.loadEvents();

        // Login with bot token
        await client.login(process.env.TOKEN);

    } catch (error) {
        console.error('Error during bot initialization:', error);
        process.exit(1);
    }
}

init();
