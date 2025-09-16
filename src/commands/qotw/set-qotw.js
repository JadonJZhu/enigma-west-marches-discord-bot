const fs = require('fs').promises;
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-qotw')
        .setDescription('Sets the question of the week')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to set for the week')
                .setRequired(true)
        ),
    category: 'qotw',
    async execute(interaction) {
        try {
            // Get the question from the slash command option
            const question = interaction.options.getString('question');

            // Validate question length (reasonable limit)
            if (question.length > 3000) {
                return interaction.reply('❌ Question is too long! Please keep it under 3000 characters.');
            }

            // Path to the data directory and file
            const dataDir = path.join(__dirname, '../../../data');
            const dataPath = path.join(dataDir, 'qotw.json');

            // Ensure data directory exists
            try {
                await fs.access(dataDir);
            } catch {
                await fs.mkdir(dataDir, { recursive: true });
            }

            // Create the data object
            const qotwData = {
                question: question,
                setBy: interaction.user.username,
                setAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            // Write to file
            await fs.writeFile(dataPath, JSON.stringify(qotwData, null, 2));

            // Send success message
            interaction.reply(`✅ Question of the week has been set!\n**Question:** ${question}`);

        } catch (error) {
            console.error('Error saving QOTW:', error);
            interaction.reply('❌ There was an error saving the question. Please try again.');
        }
    },
};
