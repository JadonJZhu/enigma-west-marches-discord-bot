const fs = require('fs');
const path = require('path');

class EventHandler {
    constructor(client) {
        this.client = client;
        this.eventsPath = path.join(__dirname, '../events');
    }

    /**
     * Load all event files from the events directory
     */
    async loadEvents() {
        console.log('Loading events...');

        if (!fs.existsSync(this.eventsPath)) {
            console.log('No events directory found, skipping event loading');
            return;
        }

        const eventFiles = fs.readdirSync(this.eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(this.eventsPath, file);
            const event = require(filePath);

            if (event.name && event.execute) {
                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args, this.client));
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args, this.client));
                }
                console.log(`Loaded event: ${event.name}`);
            } else {
                console.warn(`Event at ${filePath} is missing required properties.`);
            }
        }

        console.log(`Loaded ${eventFiles.length} events`);
    }
}

module.exports = EventHandler;
