const fs = require('fs').promises;
const path = require('path');
const env = require('../../config/env');
const logger = require('../../utils/logger');

async function getGuildChannel(guild, channelId) {
    if (!channelId) {
        return null;
    }

    return guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
}

async function getBotUpdatesChannel(guild) {
    if (env.BOT_UPDATES_CHANNEL_ID) {
        return getGuildChannel(guild, env.BOT_UPDATES_CHANNEL_ID);
    }

    return guild.channels.cache.find(ch => ch.name === 'bot-testing');
}

async function sunday_start_qotw(client) {
    try {
        // Get the specific server
        const guild = client.guilds.cache.get(env.GUILD_ID);
        if (!guild) {
            logger.error(`Could not find server with ID: ${env.GUILD_ID}`);
            return;
        }

        // Fetch the configured qotw channel directly by ID.
        const qotwChannel = await getGuildChannel(guild, env.QOTW_CHANNEL_ID);

        if (!qotwChannel) {
            logger.error(`Could not find QOTW channel with ID: ${env.QOTW_CHANNEL_ID}`);

            const botUpdatesChannel = await getBotUpdatesChannel(guild);
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(`<@${env.OWNER_ID}> Error: Could not find configured QOTW channel for Question of the Week.`);
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
            const botUpdatesChannel = await getBotUpdatesChannel(guild);
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(`<@${env.OWNER_ID}> No QOTW questions available. The questions list is empty.`);
            }
            return;
        }

        // Check if we've run out of questions
        if (currentIndex >= questions.length) {
            // Send message indicating no questions left to bot-testing channel
            const botUpdatesChannel = await getBotUpdatesChannel(guild);
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(`<@${env.OWNER_ID}> There are no QOTW questions left!`);
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
            const botUpdatesChannel = await getBotUpdatesChannel(guild);
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(
                    `<@${env.OWNER_ID}> ⚠️ QOTW was posted successfully, but failed to save tracking data to qotw.json: ${writeError.message}\n` +
                    `The same question (index ${currentIndex}) may be re-posted next week. Please update qotw.json manually.`
                );
            }
        }

    } catch (error) {
        logger.error('Error sending Sunday QOTW:', error);
        try {
            const guild = client.guilds.cache.get(env.GUILD_ID);
            const botUpdatesChannel = guild ? await getBotUpdatesChannel(guild) : null;
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(`<@${env.OWNER_ID}> ❌ QOTW start failed: ${error.message}`);
            }
        } catch (notifyError) {
            logger.error('Failed to send QOTW start error notification:', notifyError);
        }
    }
}

module.exports = sunday_start_qotw;
