const fs = require('fs').promises;
const path = require('path');

async function sunday_downtime_selection(client) {
    try {
        // Get the specific server
        const guild = client.guilds.cache.get('1009959008456683660');
        if (!guild) {
            console.error('Could not find server with ID: 1009959008456683660');
            return;
        }

        // Find the downtimes channel by name within the specific server
        const channel = guild.channels.cache.find(ch => ch.name === 'downtimes');

        if (!channel) {
            console.error('Could not find channel named "downtimes"');

            // Try to find bot-testing channel for error message within the same server
            const botUpdatesChannel = guild.channels.cache.find(ch => ch.name === 'bot-testing');
            if (botUpdatesChannel) {
                await botUpdatesChannel.send('Error: Could not find "downtimes" channel for downtime selection.');
                console.log('Error message sent to bot-testing channel');
            } else {
                console.error('Could not find "bot-testing" channel either. Doing nothing.');
            }
            return;
        }

        // Read downtimes list
        const downtimesPath = path.join(__dirname, '../../../data/downtimes.json');
        const downtimesData = await fs.readFile(downtimesPath, 'utf8');
        const downtimes = JSON.parse(downtimesData);

        if (!downtimes.added || downtimes.added.length === 0) {
            console.log('No added downtimes found');
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

        // Send first choice poll
        await channel.send({
            poll: {
                question: { text: 'Choose your FIRST downtime for this week:' },
                answers: firstPollAnswers,
                duration: 7 * 24, // 1 week in hours
                allowMultiselect: false
            }
        });

        // Send second choice poll
        await channel.send({
            poll: {
                question: { text: 'Choose your SECOND downtime for this week:' },
                answers: pollAnswers,
                duration: 7 * 24, // 1 week in hours
                allowMultiselect: false
            }
        });

        console.log('Sunday downtime selection polls sent successfully');
    } catch (error) {
        console.error('Error sending Sunday downtime selection:', error);
    }
}

module.exports = sunday_downtime_selection;
