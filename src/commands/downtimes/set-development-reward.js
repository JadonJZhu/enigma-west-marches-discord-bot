const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DOWNTIMES_FILE = path.join(__dirname, '../../../data/downtimes.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-development-reward')
        .setDescription('Set the development reward value')
        .addIntegerOption(option =>
            option.setName('reward')
                .setDescription('The new development reward value')
                .setRequired(true)
                .setMinValue(0)
        ),
    category: 'downtimes',
    async execute(interaction) {
        const newReward = interaction.options.getInteger('reward');

        try {
            // Read the current downtimes data
            const downtimesData = JSON.parse(fs.readFileSync(DOWNTIMES_FILE, 'utf8'));

            // Store the old reward value for the response
            const oldReward = downtimesData.developmentReward;

            // Update the development reward
            downtimesData.developmentReward = newReward;

            // Save the updated data
            fs.writeFileSync(DOWNTIMES_FILE, JSON.stringify(downtimesData, null, 4));

            await interaction.reply({
                content: `✅ Development reward updated from **${oldReward}** to **${newReward}**!`,
                ephemeral: false
            });

        } catch (error) {
            console.error('Error handling set-development-reward command:', error);
            await interaction.reply({
                content: '❌ There was an error processing your request. Please try again.',
                ephemeral: true
            });
        }
    },
};
