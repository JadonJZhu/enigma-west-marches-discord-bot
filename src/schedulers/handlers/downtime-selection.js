const fs = require('fs').promises;
const path = require('path');
const env = require('../../config/env');
const logger = require('../../utils/logger');

// Helper function to split array into chunks of specified size
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

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

async function sunday_downtime_selection(client) {
    try {
        // Get the specific server
        const guild = client.guilds.cache.get(env.GUILD_ID);
        if (!guild) {
            logger.error(`Could not find server with ID: ${env.GUILD_ID}`);
            return;
        }

        // Fetch the configured downtimes channel directly by ID.
        const channel = await getGuildChannel(guild, env.DOWNTIME_CHANNEL_ID);

        if (!channel) {
            logger.error(`Could not find downtime channel with ID: ${env.DOWNTIME_CHANNEL_ID}`);

            const botUpdatesChannel = await getBotUpdatesChannel(guild);
            if (botUpdatesChannel) {
                await botUpdatesChannel.send(`<@${env.OWNER_ID}> Error: Could not find configured downtime channel for downtime selection.`);
                logger.info('Error message sent to bot-testing channel');
            } else {
                logger.error('Could not find "bot-testing" channel either. Doing nothing.');
            }
            return;
        }

        // Read downtimes list
        const downtimesPath = path.join(__dirname, '../../../data/downtimes.json');
        const downtimesData = await fs.readFile(downtimesPath, 'utf8');
        const downtimes = JSON.parse(downtimesData);

        if (!downtimes.added || downtimes.added.length === 0) {
            logger.info('No added downtimes found');
            return;
        }

        // Create poll answers from downtimes
        const pollAnswers = downtimes.added.map((downtime) => ({
            text: downtime.replace(/:[^:]+:$/, '').trim() // Remove emoji from text
        }));

        // Check if "Go On A Mission 🧙‍♂️" is in the added array
        const missionDowntime = "Go On A Mission 🧙‍♂️";
        const hasMissionDowntime = downtimes.added.includes(missionDowntime);

        // Create first poll answers (exclude mission if present)
        const firstPollAnswers = hasMissionDowntime
            ? pollAnswers.filter(answer => !answer.text.includes("Go On A Mission"))
            : pollAnswers;

        // Split answers into chunks of 10 (Discord limit)
        const MAX_POLL_OPTIONS = 10;
        const firstPollChunks = chunkArray(firstPollAnswers, MAX_POLL_OPTIONS);
        const secondPollChunks = chunkArray(pollAnswers, MAX_POLL_OPTIONS);

        // Send first choice polls
        for (let i = 0; i < firstPollChunks.length; i++) {
            const isContinuation = i > 0;
            const questionText = isContinuation
                ? `Choose your FIRST downtime for this week (continued)`
                : `Choose your FIRST downtime for this week: (Development Reward: ${downtimes.developmentReward} GP)`;
            
            await channel.send({
                poll: {
                    question: { text: questionText },
                    answers: firstPollChunks[i],
                    duration: 7 * 24, // 1 week in hours
                    allowMultiselect: false
                }
            });
        }

        // Send second choice polls
        for (let i = 0; i < secondPollChunks.length; i++) {
            const isContinuation = i > 0;
            const questionText = isContinuation
                ? `Choose your SECOND downtime for this week (continued)`
                : `Choose your SECOND downtime for this week: (Development Reward: ${downtimes.developmentReward} GP)`;
            
            await channel.send({
                poll: {
                    question: { text: questionText },
                    answers: secondPollChunks[i],
                    duration: 7 * 24, // 1 week in hours
                    allowMultiselect: false
                }
            });
        }

        logger.info('Sunday downtime selection polls sent successfully');
    } catch (error) {
        logger.error('Error sending Sunday downtime selection:', error);
    }
}

module.exports = sunday_downtime_selection;
