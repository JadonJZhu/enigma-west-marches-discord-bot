module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        // Handle prefix commands
        client.commandHandler.handlePrefixCommand(message);
    },
};
