const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DOWNTIMES_FILE = path.join(__dirname, '../../../data/downtimes.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-downtimes')
        .setDescription('Show all available and active downtime activities'),
    category: 'downtimes',
    async execute(interaction) {
        try {
            // Read the current downtimes list
            const downtimesData = JSON.parse(fs.readFileSync(DOWNTIMES_FILE, 'utf8'));

            // Format the added activities list
            const addedList = downtimesData.added.length > 0
                ? downtimesData.added.map(activity => `• ${activity}`).join('\n')
                : '*No active downtimes*';

            // Format the unadded activities list
            const unaddedList = downtimesData.unadded.length > 0
                ? downtimesData.unadded.map(activity => `• ${activity}`).join('\n')
                : '*No available downtimes*';

            // Create the response embed content
            const response = `## Downtime Activities

**Development Reward: ${downtimesData.developmentReward} GP**

### ✅ Active Downtimes (${downtimesData.added.length})
${addedList}

### ❌ Available Downtimes (${downtimesData.unadded.length})
${unaddedList}`;

            await interaction.reply({
                content: response,
                ephemeral: false
            });

        } catch (error) {
            console.error('Error handling show-downtimes command:', error);
            await interaction.reply({
                content: '❌ There was an error retrieving the downtimes list. Please try again.',
                ephemeral: true
            });
        }
    },
};
