const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DOWNTIMES_FILE = path.join(__dirname, '../../../data/downtimes.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-downtime')
        .setDescription('Add a downtime activity to your active list')
        .setDefaultPermission(false)
        .addStringOption(option =>
            option.setName('activity')
                .setDescription('The downtime activity to add')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    category: 'downtimes',
    async execute(interaction) {
        const activityName = interaction.options.getString('activity');

        try {
            // Read the current downtimes list
            const downtimesData = JSON.parse(fs.readFileSync(DOWNTIMES_FILE, 'utf8'));

            // Check if the activity exists in unadded list
            const activityIndex = downtimesData.unadded.indexOf(activityName);

            if (activityIndex === -1) {
                return await interaction.reply({
                    content: `❌ **${activityName}** is not available in the unadded downtimes list.`,
                    ephemeral: true
                });
            }

            // Move the activity from unadded to added
            const activity = downtimesData.unadded.splice(activityIndex, 1)[0];
            downtimesData.added.push(activity);

            // Save the updated data
            fs.writeFileSync(DOWNTIMES_FILE, JSON.stringify(downtimesData, null, 4));

            await interaction.reply({
                content: `✅ Successfully added **${activity}** to your active downtimes!`,
                ephemeral: false
            });

        } catch (error) {
            console.error('Error handling add-downtime command:', error);
            await interaction.reply({
                content: '❌ There was an error processing your request. Please try again.',
                ephemeral: true
            });
        }
    },
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();

        try {
            // Read the current downtimes list
            const downtimesData = JSON.parse(fs.readFileSync(DOWNTIMES_FILE, 'utf8'));

            // Filter unadded activities based on user input
            const filtered = downtimesData.unadded.filter(activity =>
                activity.toLowerCase().includes(focusedValue.toLowerCase())
            );

            // Limit to 25 results (Discord's limit) and map to the required format
            const choices = filtered.slice(0, 25).map(activity => ({
                name: activity,
                value: activity
            }));

            await interaction.respond(choices);
        } catch (error) {
            console.error('Error handling autocomplete:', error);
            // Respond with empty array on error to prevent command failure
            await interaction.respond([]);
        }
    },
};
