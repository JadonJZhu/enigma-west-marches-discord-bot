const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Handle prefix commands
        client.commandHandler.handlePrefixCommand(message);

        // Handle QOTW responses
        await handleQOTWResponse(message);
    },
};

async function handleQOTWResponse(message) {
    // Skip bot messages and DMs
    if (message.author.bot || !message.guild) return;

    try {
        // Read QOTW data
        const qotwPath = path.join(__dirname, '../../data/qotw.json');
        const qotwData = await fs.readFile(qotwPath, 'utf8');
        const qotw = JSON.parse(qotwData);

        // Check if there's an active QOTW
        const currentQOTW = qotw['current-qotw'];
        if (!currentQOTW) return;

        // Check if message is in the correct channel
        if (message.channel.id !== currentQOTW.channelId) return;

        // Check if we're within the time window
        const now = new Date();
        const endTime = new Date(currentQOTW.endTime);
        if (now > endTime) {
            // Clean up expired QOTW
            delete qotw['current-qotw'];
            await fs.writeFile(qotwPath, JSON.stringify(qotw, null, 4));
            return;
        }

        // Check if user already responded
        const respondentIds = qotw['respondent-ids'] || [];
        if (respondentIds.includes(message.author.id)) return;

        // Skip messages that start with ">" (likely quotes)
        if (message.content.startsWith('>')) return;

        // Add user to respondents
        respondentIds.push(message.author.id);
        qotw['respondent-ids'] = respondentIds;

        // Save updated data
        await fs.writeFile(qotwPath, JSON.stringify(qotw, null, 4));
        console.log(`QOTW response recorded for user: ${message.author.username} (${message.author.id})`);

    } catch (error) {
        console.error('Error handling QOTW response:', error);
    }
}
