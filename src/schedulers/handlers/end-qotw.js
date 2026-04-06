const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

async function sunday_end_qotw(client) {
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
                await botUpdatesChannel.send('Error: Could not find "qotw" channel for Question of the Week rewards.');
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

        // Unpin the previous QOTW message
        const currentQotw = qotw['current-qotw'];
        if (currentQotw?.messageId && currentQotw?.channelId) {
            try {
                const channel = guild.channels.cache.get(currentQotw.channelId);
                if (channel) {
                    const message = await channel.messages.fetch(currentQotw.messageId);
                    if (message.pinned) {
                        await message.unpin();
                        logger.info('Previous QOTW message unpinned');
                    }
                }
            } catch (unpinError) {
                logger.error('Failed to unpin previous QOTW message:', unpinError);
            }
        }

        // Send reward message to previous respondents and clear the list
        const previousRespondents = qotw['respondent-ids'] || [];
        if (previousRespondents.length > 0) {
            const rewardMessage = qotw['reward-message'] || 'Thanks for participating!';
            const userMentions = previousRespondents.map(id => `<@${id}>`).join(' ');

            await qotwChannel.send(`${userMentions}\n${rewardMessage}`);
            logger.info('Reward message sent to previous respondents');
        }

        // Clear respondent IDs for new question
        qotw['respondent-ids'] = [];
        try {
            await fs.writeFile(qotwPath, JSON.stringify(qotw, null, 4));
            logger.info('Respondent IDs cleared for new QOTW');
        } catch (writeError) {
            logger.error('Failed to save QOTW data after sending rewards:', writeError);
            const botUpdatesChannel = guild.channels.cache.find(ch => ch.name === 'bot-testing');
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(
                    `⚠️ QOTW rewards were sent, but failed to clear respondent IDs in qotw.json: ${writeError.message}\n` +
                    `The same users may be rewarded again next week. Please clear respondent-ids manually.`
                );
            }
        }

    } catch (error) {
        logger.error('Error sending Sunday QOTW rewards:', error);
        try {
            const guild = client.guilds.cache.get('1009959008456683660');
            const botUpdatesChannel = guild?.channels.cache.find(ch => ch.name === 'bot-testing');
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(`❌ QOTW end/rewards failed: ${error.message}`);
            }
        } catch (notifyError) {
            logger.error('Failed to send QOTW end error notification:', notifyError);
        }
    }
}

module.exports = sunday_end_qotw;
