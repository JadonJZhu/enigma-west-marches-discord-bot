const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    category: 'general',
    async execute(interaction) {
        const sent = Date.now();
        await interaction.reply('Pong!');

        const timeDiff = Date.now() - sent;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply(`Pong! 🏓\nLatency: ${timeDiff}ms\nAPI Latency: ${apiLatency}ms`);
    },
};
