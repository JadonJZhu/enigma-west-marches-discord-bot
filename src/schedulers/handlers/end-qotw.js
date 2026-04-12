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

async function sunday_end_qotw(client) {
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
                await botUpdatesChannel.send(`<@${env.OWNER_ID}> Error: Could not find configured QOTW channel for Question of the Week rewards.`);
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
        } else {
            const botUpdatesChannel = await getBotUpdatesChannel(guild);
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(`<@${env.OWNER_ID}> No respondents for this week's QOTW. No rewards were sent.`);
                logger.info('No respondents notification sent to bot-testing channel');
            }
        }

        // Clear respondent IDs for new question
        qotw['respondent-ids'] = [];
        try {
            await fs.writeFile(qotwPath, JSON.stringify(qotw, null, 4));
            logger.info('Respondent IDs cleared for new QOTW');
        } catch (writeError) {
            logger.error('Failed to save QOTW data after sending rewards:', writeError);
            const botUpdatesChannel = await getBotUpdatesChannel(guild);
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(
                    `<@${env.OWNER_ID}> ⚠️ QOTW rewards were sent, but failed to clear respondent IDs in qotw.json: ${writeError.message}\n` +
                    `The same users may be rewarded again next week. Please clear respondent-ids manually.`
                );
            }
        }

    } catch (error) {
        logger.error('Error sending Sunday QOTW rewards:', error);
        try {
            const guild = client.guilds.cache.get(env.GUILD_ID);
            const botUpdatesChannel = guild ? await getBotUpdatesChannel(guild) : null;
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(`<@${env.OWNER_ID}> ❌ QOTW end/rewards failed: ${error.message}`);
            }
        } catch (notifyError) {
            logger.error('Failed to send QOTW end error notification:', notifyError);
        }
    }
}

module.exports = sunday_end_qotw;
