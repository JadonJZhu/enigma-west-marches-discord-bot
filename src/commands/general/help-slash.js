const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands'),
    category: 'general',
    async execute(interaction) {
        const { slashCommands } = interaction.client.commandHandler;

        const commandList = slashCommands.map(cmd => `\`/${cmd.data.name}\` - ${cmd.data.description}`).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Available Slash Commands')
            .setDescription(commandList || 'No slash commands available')
            .setColor('#0099ff')
            .setFooter({ text: 'Use /help for this information' });

        await interaction.reply({ embeds: [embed] });
    },
};
