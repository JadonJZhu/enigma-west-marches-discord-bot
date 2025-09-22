const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection, ApplicationCommandPermissionType } = require('discord.js');
const fs = require('fs');
const path = require('path');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
        this.slashCommands = new Collection();
        this.prefix = '!'; // Default prefix, can be configured
        this.commandsPath = path.join(__dirname, '../commands');
    }

    /**
     * Load all command files from the commands directory
     */
    async loadCommands() {
        console.log('Loading commands...');

        const commandFolders = fs.readdirSync(this.commandsPath);

        for (const folder of commandFolders) {
            const folderPath = path.join(this.commandsPath, folder);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);

                if (command.data && command.execute) {
                    // Slash command
                    this.slashCommands.set(command.data.name, command);
                } else if (command.name && command.execute) {
                    // Prefix command
                    this.commands.set(command.name, command);
                } else {
                    console.warn(`Command at ${filePath} is missing required properties.`);
                }
            }
        }

        console.log(`Loaded ${this.commands.size} prefix commands and ${this.slashCommands.size} slash commands`);
    }

    /**
     * Register slash commands with Discord
     */
    async registerSlashCommands() {
        if (this.slashCommands.size === 0) return;

        const commands = this.slashCommands.map(command => command.data.toJSON());
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        try {
            console.log('Started refreshing application (/) commands.');

            // Check if GUILD_ID is set for guild-specific commands
            const guildId = process.env.GUILD_ID;

            if (guildId) {
                console.log(`Registering commands as guild-specific for guild: ${guildId}`);
                await rest.put(
                    Routes.applicationGuildCommands(this.client.user.id, guildId),
                    { body: commands }
                );
                console.log('Successfully reloaded guild-specific application (/) commands.');
            } else {
                console.log('No GUILD_ID specified, registering commands globally.');
                await rest.put(
                    Routes.applicationCommands(this.client.user.id),
                    { body: commands }
                );
                console.log('Successfully reloaded global application (/) commands.');
            }

            // Set permissions for restricted commands
            await this.setCommandPermissions(guildId);
        } catch (error) {
            console.error('Error registering slash commands:', error);
        }
    }

    /**
     * Set permissions for restricted slash commands
     */
    async setCommandPermissions(guildId) {
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        // Define commands that require specific role permissions
        const restrictedCommands = [
            // QOTW and Downtime commands are now controlled by server admins through Discord's permission system
        ];

        const adminRoleId = '1013254145458847885'; // Your admin role ID

        try {
            // Get the registered commands to find their IDs
            let commands;
            if (guildId) {
                commands = await rest.get(
                    Routes.applicationGuildCommands(this.client.user.id, guildId)
                );
            } else {
                commands = await rest.get(
                    Routes.applicationCommands(this.client.user.id)
                );
            }

            for (const command of commands) {
                if (restrictedCommands.includes(command.name)) {
                    const permissions = [{
                        id: adminRoleId,
                        type: ApplicationCommandPermissionType.Role,
                        permission: true
                    }];

                    try {
                        if (guildId) {
                            await rest.put(
                                Routes.applicationCommandPermissions(this.client.user.id, guildId, command.id),
                                { body: { permissions } }
                            );
                        } else {
                            // For global commands, permissions need to be set per guild
                            // This would require iterating through all guilds the bot is in
                            console.warn(`Cannot set permissions for global command "${command.name}". Use guild-specific commands for role-based permissions.`);
                        }
                        console.log(`Set permissions for command: ${command.name}`);
                    } catch (permError) {
                        console.error(`Error setting permissions for ${command.name}:`, permError);
                    }
                }
            }
        } catch (error) {
            console.error('Error setting command permissions:', error);
        }
    }

    /**
     * Handle prefix commands
     */
    handlePrefixCommand(message) {
        if (!message.content.startsWith(this.prefix) || message.author.bot) return;

        const args = message.content.slice(this.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = this.commands.get(commandName) ||
                       this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        try {
            command.execute(message, args, this.client);
        } catch (error) {
            console.error('Error executing prefix command:', error);
            message.reply('There was an error executing that command!');
        }
    }

    /**
     * Handle slash commands
     */
    async handleSlashCommand(interaction) {
        if (!interaction.isCommand()) return;

        const command = this.slashCommands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Error executing slash command:', error);

            const errorMessage = {
                content: 'There was an error executing this command!',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }

    /**
     * Handle autocomplete interactions
     */
    async handleAutocomplete(interaction) {
        if (!interaction.isAutocomplete()) return;

        const command = this.slashCommands.get(interaction.commandName);

        if (!command || !command.autocomplete) return;

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error('Error handling autocomplete:', error);
            // Respond with empty array on error to prevent interaction failure
            await interaction.respond([]);
        }
    }

    /**
     * Get all loaded commands
     */
    getCommands() {
        return {
            prefix: Array.from(this.commands.values()),
            slash: Array.from(this.slashCommands.values())
        };
    }

    /**
     * Set the command prefix
     */
    setPrefix(prefix) {
        this.prefix = prefix;
    }
}

module.exports = CommandHandler;
