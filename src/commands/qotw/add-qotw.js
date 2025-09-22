const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-qotw')
        .setDescription('Add a new Question of the Week')
        .setDefaultMemberPermissions(null)
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to add')
                .setRequired(true)
        ),

    async execute(interaction) {
        const question = interaction.options.getString('question');

        try {
            // Read the current qotw.json file
            const qotwPath = path.join(__dirname, '../../../data/qotw.json');
            const qotwData = JSON.parse(fs.readFileSync(qotwPath, 'utf8'));

            // Add the new question to the qotw array
            qotwData.qotw.push(question);

            // Write the updated data back to the file
            fs.writeFileSync(qotwPath, JSON.stringify(qotwData, null, 4));

            await interaction.reply(`✅ Successfully added the question: "${question}"`);
        } catch (error) {
            console.error('Error adding QOTW:', error);
            await interaction.reply('❌ There was an error adding the question. Please try again.');
        }
    },
};
