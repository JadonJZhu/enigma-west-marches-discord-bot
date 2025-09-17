// Event handlers for scheduled tasks
// Each handler should be an async function that takes the client as parameter

const fs = require('fs').promises;
const path = require('path');

const handlers = {
    async sunday_downtime_selection(client) {
        try {
            const channel = await client.channels.fetch('1382565072571990047');

            if (!channel) {
                console.error('Could not find channel with ID: 1382565072571990047');
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

            console.log('Tuesday downtime selection completed successfully');
        } catch (error) {
            console.error('Error sending Tuesday downtime selection:', error);
        }
    },

    async tuesday_qotw(client) {
        try {
            const channel = await client.channels.fetch('1382565072571990047');

            if (!channel) {
                console.error('Could not find channel with ID: 1382565072571990047');
                return;
            }

            // Read QOTW data
            const qotwPath = path.join(__dirname, '../../data/qotw.json');
            const qotwData = await fs.readFile(qotwPath, 'utf8');
            const qotw = JSON.parse(qotwData);

            // Get current question
            const currentIndex = qotw['current-qotw-index'] || 0;
            const questions = qotw.qotw || [];

            if (questions.length === 0) {
                console.log('No QOTW questions available');
                return;
            }

            // Get the current question, cycling back to start if at end
            const currentQuestion = questions[currentIndex % questions.length];

            // Send the question
            await channel.send(`**Question of the Week:**\n${currentQuestion}`);
            console.log('QOTW message sent');

            // Increment the index
            const nextIndex = (currentIndex + 1) % questions.length;
            qotw['current-qotw-index'] = nextIndex;

            // Save updated data
            await fs.writeFile(qotwPath, JSON.stringify(qotw, null, 4));
            console.log('QOTW index incremented and saved');

        } catch (error) {
            console.error('Error sending Tuesday QOTW:', error);
        }
    },

};

module.exports = handlers;
