const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-qotw')
        .setDescription('Remove a Question of the Week')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to remove')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();

        try {
            // Read the current qotw.json file
            const qotwPath = path.join(__dirname, '../../../data/qotw.json');
            const qotwData = JSON.parse(fs.readFileSync(qotwPath, 'utf8'));

            // Filter questions based on the focused value
            const filtered = qotwData.qotw.filter(question =>
                question.toLowerCase().includes(focusedValue)
            );

            // Return up to 25 results (Discord limit)
            const choices = filtered.slice(0, 25).map(question => ({
                name: question.length > 100 ? question.substring(0, 97) + '...' : question,
                value: question
            }));

            await interaction.respond(choices);
        } catch (error) {
            console.error('Error in autocomplete:', error);
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        const question = interaction.options.getString('question');

        try {
            // Read the current qotw.json file
            const qotwPath = path.join(__dirname, '../../../data/qotw.json');
            const qotwData = JSON.parse(fs.readFileSync(qotwPath, 'utf8'));

            // Find the index of the question to remove
            const questionIndex = qotwData.qotw.indexOf(question);

            if (questionIndex === -1) {
                await interaction.reply('❌ The specified question was not found in the QOTW list.');
                return;
            }

            // Remove the question from the arr y
            qotwData.qotw.splice(questionIndex, 1);

            // If the removed question was the current one, adjust the current-qotw-index
            if (qotwData['current-qotw-index'] > questionIndex) {
                qotwData['current-qotw-index'] = Math.max(0, qotwData['current-qotw-index'] - 1);
            } else if (qotwData['current-qotw-index'] === questionIndex && qotwData.qotw.length > 0) {
                // If we removed the current question, set to first question or 0 if empty
                qotwData['current-qotw-index'] = 0;
            } else if (qotwData.qotw.length === 0) {
                qotwData['current-qotw-index'] = 0;
            }

            // Write the updated data back to the file
            fs.writeFileSync(qotwPath, JSON.stringify(qotwData, null, 4));

            await interaction.reply(`✅ Successfully removed the question: "${question}"`);
        } catch (error) {
            console.error('Error removing QOTW:', error);
            await interaction.reply('❌ There was an error removing the question. Please try again.');
        }
    },
};
