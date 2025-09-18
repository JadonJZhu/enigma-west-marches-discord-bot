const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-upcoming-qotw')
        .setDescription('Show all Question of the Week questions and the upcoming one'),

    async execute(interaction) {
        try {
            // Read the current qotw.json file
            const qotwPath = path.join(__dirname, '../../../data/qotw.json');
            const qotwData = JSON.parse(fs.readFileSync(qotwPath, 'utf8'));

            const { qotw, 'upcoming-qotw-index': currentIndex } = qotwData;

            // Check if there are any questions
            if (!qotw || qotw.length === 0) {
                await interaction.reply('📝 There are no Question of the Week questions currently stored.');
                return;
            }

            // Get the current question
            let currentQuestion = 'None';
            let currentQuestionText = '';

            if (currentIndex >= 0 && currentIndex < qotw.length) {
                currentQuestion = `#${currentIndex + 1}`;
                currentQuestionText = qotw[currentIndex];
            } else {
                currentQuestion = 'No more questions set.';
            }

            // Format all questions with numbers
            const allQuestions = qotw.map((question, index) =>
                `${index + 1}. ${question}`
            ).join('\n');

            const response = `📋 **Question of the Week Questions:**\n\n` +
                `**Current Question:** ${currentQuestion}\n` +
                `${currentQuestionText ? `"${currentQuestionText}"\n\n` : ''}` +
                `**All Questions (${qotw.length}):**\n${allQuestions}`;

            await interaction.reply(response);
        } catch (error) {
            console.error('Error showing QOTW:', error);
            await interaction.reply('❌ There was an error retrieving the questions. Please try again.');
        }
    },
};
