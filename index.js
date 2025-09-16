// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
// Load the environment variables from the .env file
require('dotenv').config();

// Create a new Discord client instance with the required intents
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
] });

// When the client is ready, log a message to the console
client.once('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Log in to Discord with your bot's token
client.login(process.env.TOKEN);