const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

async function sunday_start_qotw(client) {
    try {
        // Get the specific server
        const guild = client.guilds.cache.get('1009959008456683660');
        if (!guild) {
            logger.error('Could not find server with ID: 1009959008456683660');
            return;
        }

        // Find the qotw channel by name within the specific server
        const qotwChannel = guild.channels.cache.find(ch => ch.name === 'qotw');

        if (!qotwChannel) {
            logger.error('Could not find channel named "qotw"');

            // Try to find bot-testing channel for error message within the same server
            const botUpdatesChannel = guild.channels.cache.find(ch => ch.name === 'bot-testing');
            if (botUpdatesChannel) {
                await botUpdatesChannel.send('Error: Could not find "qotw" channel for Question of the Week.');
                logger.info('Error message sent to bot-testing channel');
            } else {
                logger.error('Could not find "bot-testing" channel either. Doing nothing.');
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
            logger.info('No QOTW questions available');
            return;
        }

        // Check if we've run out of questions
        if (currentIndex >= questions.length) {
            // Send message indicating no questions left to bot-testing channel
            const botUpdatesChannel = guild.channels.cache.find(ch => ch.name === 'bot-testing');
            if (botUpdatesChannel) {
                await botUpdatesChannel.send('There are no QOTW questions left!');
                logger.info('No QOTW questions left message sent to bot-testing channel');
            } else {
                logger.error('Could not find "bot-testing" channel. Cannot send no questions left message.');
            }
            return;
        }

        // Get the current question
        const currentQuestion = questions[currentIndex];

        // Send the question
        const qotwMessage = await qotwChannel.send(`**Question of the Week:**\n${currentQuestion}`);
        logger.info('QOTW message sent');

        // Pin the QOTW message
        await qotwMessage.pin();
        logger.info('QOTW message pinned');

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
        try {
            await fs.writeFile(qotwPath, JSON.stringify(qotw, null, 4));
            logger.info('QOTW data updated with tracking information');
        } catch (writeError) {
            logger.error('Failed to save QOTW data after sending message:', writeError);
            const botUpdatesChannel = guild.channels.cache.find(ch => ch.name === 'bot-testing');
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(
                    `⚠️ QOTW was posted successfully, but failed to save tracking data to qotw.json: ${writeError.message}\n` +
                    `The same question (index ${currentIndex}) may be re-posted next week. Please update qotw.json manually.`
                );
            }
        }

    } catch (error) {
        logger.error('Error sending Sunday QOTW:', error);
        try {
            const guild = client.guilds.cache.get('1009959008456683660');
            const botUpdatesChannel = guild?.channels.cache.find(ch => ch.name === 'bot-testing');
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(`❌ QOTW start failed: ${error.message}`);
            }
        } catch (notifyError) {
            logger.error('Failed to send QOTW start error notification:', notifyError);
        }
    }
}

module.exports = sunday_start_qotw;
