const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const env = require('../../config/env');

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-qotw')
        .setDescription('Manually start the Question of the Week (if scheduled time was missed)'),
    category: 'qotw',
    async execute(interaction) {
        try {
            // Get the client from the interaction
            const client = interaction.client;

            // Get the specific server
            const guild = client.guilds.cache.get(env.GUILD_ID);
            if (!guild) {
                console.error(`Could not find server with ID: ${env.GUILD_ID}`);
                await interaction.reply('❌ Error: Could not find the server.');
                return;
            }

            // Fetch the configured qotw channel directly by ID.
            const qotwChannel = await getGuildChannel(guild, env.QOTW_CHANNEL_ID);

            if (!qotwChannel) {
                console.error(`Could not find QOTW channel with ID: ${env.QOTW_CHANNEL_ID}`);

                const botUpdatesChannel = await getBotUpdatesChannel(guild);
                if (botUpdatesChannel) {
                    await botUpdatesChannel.send(`<@${env.OWNER_ID}> Error: Could not find configured QOTW channel for Question of the Week.`);
                    console.log('Error message sent to bot-testing channel');
                } else {
                    console.error('Could not find "bot-testing" channel either. Doing nothing.');
                }
                await interaction.reply('❌ Error: Could not find the configured QOTW channel.');
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
                await interaction.reply('❌ No QOTW questions available.');
                return;
            }

            // Check if we've run out of questions
            if (currentIndex >= questions.length) {
                // Send message indicating no questions left
                await qotwChannel.send('There are no QOTW questions left!');
                console.log('No QOTW questions left message sent');
                await interaction.reply('⚠️ There are no QOTW questions left!');
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

            // Reply to the interaction
            await interaction.reply(`✅ Successfully sent QOTW: "${currentQuestion}"`);

        } catch (error) {
            console.error('Error sending QOTW:', error);
            await interaction.reply('❌ There was an error sending the QOTW. Please try again.');
        }
    },
};

