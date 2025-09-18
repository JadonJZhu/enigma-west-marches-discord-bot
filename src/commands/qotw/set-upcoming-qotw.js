const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-upcoming-qotw')
        .setDescription('Set the upcoming Question of the Week')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to set as upcoming')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();

        try {
            // Read the upcoming qotw.json file
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
            // Read the upcoming qotw.json file
            const qotwPath = path.join(__dirname, '../../../data/qotw.json');
            const qotwData = JSON.parse(fs.readFileSync(qotwPath, 'utf8'));

            // Find the index of the selected question
            const questionIndex = qotwData.qotw.indexOf(question);

            if (questionIndex === -1) {
                await interaction.reply('❌ The specified question was not found in the QOTW list.');
                return;
            }

            // Update the upcoming-qotw-index to the selected question
            qotwData['upcoming-qotw-index'] = questionIndex;

            // Reset respondent-ids since this is a new current question
            qotwData['respondent-ids'] = [];

            // Write the updated data back to the file
            fs.writeFileSync(qotwPath, JSON.stringify(qotwData, null, 4));

            await interaction.reply(`✅ Successfully set the upcoming QOTW to: "${question}"\n\n**Question #${questionIndex + 1}** of ${qotwData.qotw.length}`);
        } catch (error) {
            console.error('Error setting upcoming QOTW:', error);
            await interaction.reply('❌ There was an error setting the upcoming question. Please try again.');
        }
    },
};
