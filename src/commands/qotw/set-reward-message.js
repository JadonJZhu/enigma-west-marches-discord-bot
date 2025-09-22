const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-reward-message')
        .setDescription('Set the reward message for QOTW')
        .setDefaultMemberPermissions(null)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The reward message to set')
                .setRequired(true)
                .setMaxLength(1000)
        ),
    category: 'qotw',
    async execute(interaction) {
        const newMessage = interaction.options.getString('message');
        const qotwPath = path.join(__dirname, '../../../data/qotw.json');

        try {
            // Read current data
            const data = JSON.parse(fs.readFileSync(qotwPath, 'utf8'));

            // Update reward message
            data['reward-message'] = newMessage;

            // Write back to file
            fs.writeFileSync(qotwPath, JSON.stringify(data, null, 4));

            await interaction.reply({
                content: `✅ Reward message has been updated to: "${newMessage}"`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error updating reward message:', error);
            await interaction.reply({
                content: '❌ There was an error updating the reward message.',
                ephemeral: true
            });
        }
    },
};
