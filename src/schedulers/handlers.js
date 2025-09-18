// Event handlers for scheduled tasks
// Each handler should be an async function that takes the client as parameter

const fs = require('fs').promises;
const path = require('path');

const handlers = {
    async sunday_downtime_selection(client) {
        try {
            // Find the downtimes channel by name
            const channel = client.channels.cache.find(ch => ch.name === 'downtimes');

            if (!channel) {
                console.error('Could not find channel named "downtimes"');

                // Try to find bot-testing channel for error message
                const botUpdatesChannel = client.channels.cache.find(ch => ch.name === 'bot-testing');
                if (botUpdatesChannel) {
                    await botUpdatesChannel.send('Error: Could not find "downtimes" channel for downtime selection.');
                    console.log('Error message sent to bot-testing channel');
                } else {
                    console.error('Could not find "bot-testing" channel either. Doing nothing.');
                }
                return;
            }

            // Read downtimes list
            const downtimesPath = path.join(__dirname, '../../data/downtimes_list.json');
            const downtimesData = await fs.readFile(downtimesPath, 'utf8');
            const downtimes = JSON.parse(downtimesData);

            if (!downtimes.added || downtimes.added.length === 0) {
                console.log('No added downtimes found');
                return;
            }

            // Create message content with list of added downtimes
            const downtimeList = downtimes.added.map(downtime => `- ${downtime}`).join('\n');

            // Send first message
            const firstMessage = await channel.send(`React with your first downtime:\n${downtimeList}`);
            console.log('First downtime selection message sent');

            // Send second message
            const secondMessage = await channel.send(`React with your second downtime:\n${downtimeList}`);
            console.log('Second downtime selection message sent');

            // Extract emojis from added downtimes and react to messages
            const emojis = downtimes.added.map(downtime => {
                // Split by space and take the last part (the emoji)
                const parts = downtime.trim().split(' ');
                return parts[parts.length - 1];
            }).filter(emoji => emoji && emoji.length > 0);

            // React to both messages with the extracted emojis
            for (const emoji of emojis) {
                try {
                    await firstMessage.react(emoji);
                    await secondMessage.react(emoji);
                } catch (error) {
                    console.error(`Failed to react with emoji ${emoji}:`, error);
                }
            }

            console.log('Sunday downtime selection completed successfully');
        } catch (error) {
            console.error('Error sending Sunday QOTW:', error);
        }
    },

    async sunday_qotw(client) {
        try {
            // Find the qotw channel by name
            const qotwChannel = client.channels.cache.find(ch => ch.name === 'qotw');

            if (!qotwChannel) {
                console.error('Could not find channel named "qotw"');

                // Try to find bot-testing channel for error message
                const botUpdatesChannel = client.channels.cache.find(ch => ch.name === 'bot-testing');
                if (botUpdatesChannel) {
                    await botUpdatesChannel.send('Error: Could not find "qotw" channel for Question of the Week.');
                    console.log('Error message sent to bot-testing channel');
                } else {
                    console.error('Could not find "bot-testing" channel either. Doing nothing.');
                }
                return;
            }

            // Read QOTW data
            const qotwPath = path.join(__dirname, '../../data/qotw.json');
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

            // Get current question
            const currentIndex = qotw['upcoming-qotw-index'] || 0;
            const questions = qotw.qotw || [];

            if (questions.length === 0) {
                console.log('No QOTW questions available');
                return;
            }

            // Check if we've run out of questions
            if (currentIndex >= questions.length) {
                // Send message indicating no questions left
                await qotwChannel.send('There are no QOTW questions left!');
                console.log('No QOTW questions left message sent');
                return;
            }

            // Get the current question
            const currentQuestion = questions[currentIndex];

            // Send the question
            const qotwMessage = await qotwChannel.send(`**Question of the Week:**\n${currentQuestion}`);
            console.log('QOTW message sent');

            // If this was the last question, also send the "no questions left" message immediately
            if (currentIndex === questions.length - 1) {
                await qotwChannel.send('There are no QOTW questions left!');
                console.log('No QOTW questions left message sent (last question)');
            }

            // Increment the index
            qotw['upcoming-qotw-index'] = currentIndex + 1;

            // Save updated data
            await fs.writeFile(qotwPath, JSON.stringify(qotw, null, 4));
            console.log('QOTW index incremented and saved');

            // Set up indefinite message collector to track respondents
            const collector = qotwChannel.createMessageCollector({
                filter: (message) => !message.author.bot // Ignore bot messages
            });

            collector.on('collect', async (message) => {
                // Read current qotw data
                const currentQotwData = await fs.readFile(qotwPath, 'utf8');
                const currentQotw = JSON.parse(currentQotwData);

                // Initialize respondent-ids array if it doesn't exist
                if (!currentQotw['respondent-ids']) {
                    currentQotw['respondent-ids'] = [];
                }

                // Add user ID if not already present
                if (!currentQotw['respondent-ids'].includes(message.author.id)) {
                    currentQotw['respondent-ids'].push(message.author.id);
                    await fs.writeFile(qotwPath, JSON.stringify(currentQotw, null, 4));
                    console.log(`Added response from user: ${message.author.username} (${message.author.id})`);
                }
            });

        } catch (error) {
            console.error('Error sending Sunday QOTW:', error);
        }
    },

};

module.exports = handlers;
