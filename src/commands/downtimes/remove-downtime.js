const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DOWNTIMES_FILE = path.join(__dirname, '../../../data/downtimes_list.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-downtime')
        .setDescription('Remove a downtime activity from your active list')
        .setDefaultPermission(false)
        .addStringOption(option =>
            option.setName('activity')
                .setDescription('The downtime activity to remove')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    category: 'downtimes',
    async execute(interaction) {
        const activityName = interaction.options.getString('activity');

        try {
            // Read the current downtimes list
            const downtimesData = JSON.parse(fs.readFileSync(DOWNTIMES_FILE, 'utf8'));

            // Check if the activity exists in added list
            const activityIndex = downtimesData.added.indexOf(activityName);

            if (activityIndex === -1) {
                return await interaction.reply({
                    content: `❌ **${activityName}** is not available in your active downtimes list.`,
                    ephemeral: true
                });
            }

            // Move the activity from added to unadded
            const activity = downtimesData.added.splice(activityIndex, 1)[0];
            downtimesData.unadded.push(activity);

            // Save the updated data
            fs.writeFileSync(DOWNTIMES_FILE, JSON.stringify(downtimesData, null, 4));

            await interaction.reply({
                content: `✅ Successfully removed **${activity}** from your active downtimes!`,
                ephemeral: false
            });

        } catch (error) {
            console.error('Error handling remove-downtime command:', error);
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

            // Filter added activities based on user input
            const filtered = downtimesData.added.filter(activity =>
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
