const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-reward-message')
        .setDescription('Display the current reward message for QOTW')
        .setDefaultMemberPermissions(null),
    category: 'qotw',
    async execute(interaction) {
        const qotwPath = path.join(__dirname, '../../../data/qotw.json');

        try {
            // Read current data
            const data = JSON.parse(fs.readFileSync(qotwPath, 'utf8'));
            const rewardMessage = data['reward-message'] || 'No reward message set.';

            await interaction.reply({
                content: `Current Reward Message: "${rewardMessage}"`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error reading reward message:', error);
            await interaction.reply({
                content: '❌ There was an error retrieving the reward message.',
                ephemeral: true
            });
        }
    },
};
