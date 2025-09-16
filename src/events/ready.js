module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
        console.log(`Bot is online and ready to serve ${client.guilds.cache.size} servers.`);

        // Register slash commands now that the client is ready
        try {
            await client.commandHandler.registerSlashCommands();
        } catch (error) {
            console.error('Error registering slash commands after ready:', error);
        }
    },
};
