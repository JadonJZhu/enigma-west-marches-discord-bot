import { Client, GatewayIntentBits, Message } from 'discord.js';
import 'dotenv/config';

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// When the client is ready, run this code (only once)
client.once('clientReady', () => {
  console.log(`Ready! Logged in as ${client.user?.tag}`);
});

// Listen for messages
client.on('messageCreate', (message: Message) => {
  // Ignore messages from the bot itself
  if (message.author.bot) return;

  // Check if the message content is "ping"
  if (message.content.toLowerCase() === 'ping') {
    // Respond with "Pong!"
    message.reply('Pong!');
  }
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);