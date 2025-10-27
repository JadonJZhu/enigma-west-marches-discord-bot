const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DOWNTIMES_FILE = path.join(__dirname, '../../../data/downtimes.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update-downtime-name')
        .setDescription('Update the name of an existing downtime activity')
        .addStringOption(option =>
            option.setName('activity')
                .setDescription('The downtime activity to rename')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('new_name')
                .setDescription('The new name for the downtime activity')
                .setRequired(true)
        ),
    category: 'downtimes',
    async execute(interaction) {
        const activityName = interaction.options.getString('activity');
        const newName = interaction.options.getString('new_name');

        try {
            // Read the current downtimes list
            const downtimesData = JSON.parse(fs.readFileSync(DOWNTIMES_FILE, 'utf8'));

            // Check if the new name already exists
            const allActivities = [...downtimesData.added, ...downtimesData.unadded];
            if (allActivities.includes(newName)) {
                return await interaction.reply({
                    content: `❌ **${newName}** already exists in the downtimes list.`,
                    ephemeral: true
                });
            }

            // Find and update the activity in added list
            let updated = false;
            let activityIndex = downtimesData.added.indexOf(activityName);
            if (activityIndex !== -1) {
                downtimesData.added[activityIndex] = newName;
                updated = true;
            } else {
                // Find and update the activity in unadded list
                activityIndex = downtimesData.unadded.indexOf(activityName);
                if (activityIndex !== -1) {
                    downtimesData.unadded[activityIndex] = newName;
                    updated = true;
                }
            }

            if (!updated) {
                return await interaction.reply({
                    content: `❌ **${activityName}** was not found in the downtimes list.`,
                    ephemeral: true
                });
            }

            // Save the updated data
            fs.writeFileSync(DOWNTIMES_FILE, JSON.stringify(downtimesData, null, 4));

            await interaction.reply({
                content: `✅ Successfully renamed **${activityName}** to **${newName}**!`,
                ephemeral: false
            });

        } catch (error) {
            console.error('Error handling update-downtime-name command:', error);
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

            // Combine both added and unadded activities
            const allActivities = [...downtimesData.added, ...downtimesData.unadded];

            // Filter activities based on user input
            const filtered = allActivities.filter(activity =>
                activity.toLowerCase().includes(focusedValue.toLowerCase())
            );

            // Remove duplicates (in case same activity appears in both lists, though unlikely)
            const uniqueFiltered = [...new Set(filtered)];

            // Limit to 25 results (Discord's limit) and map to the required format
            const choices = uniqueFiltered.slice(0, 25).map(activity => ({
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
