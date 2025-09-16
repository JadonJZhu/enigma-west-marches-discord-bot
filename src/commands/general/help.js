const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Shows all available commands',
    aliases: ['commands', 'h'],
    usage: '!help [command]',
    category: 'general',
    cooldown: 3,
    execute(message, args, client) {
        const { commands } = client.commandHandler;

        if (args.length > 0) {
            // Show help for specific command
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) ||
                           commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) {
                return message.reply(`No command found with name \`${commandName}\``);
            }

            const embed = new EmbedBuilder()
                .setTitle(`Help: ${command.name}`)
                .setColor('#0099ff')
                .addFields(
                    { name: 'Description', value: command.description || 'No description available' },
                    { name: 'Usage', value: command.usage || `!${command.name}` },
                    { name: 'Aliases', value: command.aliases ? command.aliases.join(', ') : 'None' },
                    { name: 'Category', value: command.category || 'general' },
                    { name: 'Cooldown', value: `${command.cooldown || 0} seconds` }
                )
                .setFooter({ text: 'Use !help to see all commands' });

            return message.reply({ embeds: [embed] });
        }

        // Show all commands
        const commandList = commands.map(cmd => `\`${cmd.name}\` - ${cmd.description}`).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Available Commands')
            .setDescription(commandList || 'No commands available')
            .setColor('#0099ff')
            .setFooter({ text: 'Use !help <command> for detailed info about a specific command' });

        message.reply({ embeds: [embed] });
    },
};
