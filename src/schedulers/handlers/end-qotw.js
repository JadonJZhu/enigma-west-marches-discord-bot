const fs = require('fs').promises;
const path = require('path');

async function sunday_end_qotw(client) {
    try {
        // Get the specific server
        const guild = client.guilds.cache.get('1009959008456683660');
        if (!guild) {
            console.error('Could not find server with ID: 1009959008456683660');
            return;
        }

        // Find the qotw channel by name within the specific server
        const qotwChannel = guild.channels.cache.find(ch => ch.name === 'qotw');

        if (!qotwChannel) {
            console.error('Could not find channel named "qotw"');

            // Try to find bot-testing channel for error message within the same server
            const botUpdatesChannel = guild.channels.cache.find(ch => ch.name === 'bot-testing');
            if (botUpdatesChannel) {
                await botUpdatesChannel.send('Error: Could not find "qotw" channel for Question of the Week rewards.');
                console.log('Error message sent to bot-testing channel');
            } else {
                console.error('Could not find "bot-testing" channel either. Doing nothing.');
            }
            return;
        }

        // Read QOTW data
        const qotwPath = path.join(__dirname, '../../../data/qotw.json');
        const qotwData = await fs.readFile(qotwPath, 'utf8');
        const qotw = JSON.parse(qotwData);

        // Send reward message to previous respondents and clear the list
        const previousRespondents = qotw['respondent-ids'] || [];
        if (previousRespondents.length > 0) {
            const rewardMessage = qotw['reward-message'] || 'Thanks for participating!';
            const userMentions = previousRespondents.map(id => `<@${id}>`).join(' ');

            await qotwChannel.send(`${userMentions}\n${rewardMessage}`);
            console.log('Reward message sent to previous respondents');
        }

        // Clear respondent IDs for new question
        qotw['respondent-ids'] = [];
        await fs.writeFile(qotwPath, JSON.stringify(qotw, null, 4));
        console.log('Respondent IDs cleared for new QOTW');

    } catch (error) {
        console.error('Error sending Sunday QOTW rewards:', error);
    }
}

module.exports = sunday_end_qotw;
