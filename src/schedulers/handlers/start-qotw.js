const fs = require('fs').promises;
const path = require('path');

async function sunday_start_qotw(client) {
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
                await botUpdatesChannel.send('Error: Could not find "qotw" channel for Question of the Week.');
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

        // Get current question
        const currentIndex = qotw['upcoming-qotw-index'] || 0;
        const questions = qotw.qotw || [];

        if (questions.length === 0) {
            console.log('No QOTW questions available');
            return;
        }

        // Check if we've run out of questions
        if (currentIndex >= questions.length) {
            // Send message indicating no questions left to bot-testing channel
            const botUpdatesChannel = guild.channels.cache.find(ch => ch.name === 'bot-testing');
            if (botUpdatesChannel) {
                await botUpdatesChannel.send('There are no QOTW questions left!');
                console.log('No QOTW questions left message sent to bot-testing channel');
            } else {
                console.error('Could not find "bot-testing" channel. Cannot send no questions left message.');
            }
            return;
        }

        // Get the current question
        const currentQuestion = questions[currentIndex];

        // Send the question
        const qotwMessage = await qotwChannel.send(`**Question of the Week:**\n${currentQuestion}`);
        console.log('QOTW message sent');

        // Pin the QOTW message
        await qotwMessage.pin();
        console.log('QOTW message pinned');

        // Record the timestamp and message ID for tracking
        const now = new Date();
        qotw['current-qotw'] = {
            messageId: qotwMessage.id,
            channelId: qotwChannel.id,
            startTime: now.toISOString(),
            endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week later
            questionIndex: currentIndex
        };

        // Increment the index
        qotw['upcoming-qotw-index'] = currentIndex + 1;

        // Save updated data
        await fs.writeFile(qotwPath, JSON.stringify(qotw, null, 4));
        console.log('QOTW data updated with tracking information');

    } catch (error) {
        console.error('Error sending Sunday QOTW:', error);
    }
}

module.exports = sunday_start_qotw;
