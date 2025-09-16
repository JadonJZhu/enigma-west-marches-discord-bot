module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Handle slash commands
        if (interaction.isCommand()) {
            await client.commandHandler.handleSlashCommand(interaction);
        }
        // Handle button interactions
        else if (interaction.isButton()) {
            // Handle button interactions here if needed
        }
        // Handle select menu interactions
        else if (interaction.isSelectMenu()) {
            // Handle select menu interactions here if needed
        }
    },
};
