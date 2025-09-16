# Discord Bot Command System

This Discord bot uses a modular command system that supports both prefix commands (`!command`) and slash commands (`/command`).

## Project Structure

```
src/
├── commands/           # Command files organized by category
│   └── general/        # General commands category
│       ├── ping.js     # Prefix ping command
│       └── ping-slash.js # Slash ping command
├── events/             # Discord event handlers
│   ├── ready.js        # Bot ready event
│   ├── messageCreate.js # Message events
│   └── interactionCreate.js # Slash command interactions
├── handlers/           # Core handlers
│   ├── commandHandler.js # Command loading and execution
│   └── eventHandler.js # Event loading
└── index.js           # Main bot file
```

## Creating Commands

### Prefix Commands

Create a new file in `src/commands/[category]/[command].js`:

```javascript
module.exports = {
    name: 'commandname',           // Command name
    description: 'Command description',
    aliases: ['alias1', 'alias2'], // Optional aliases
    usage: '!command [args]',      // Usage example
    category: 'category',          // Command category
    cooldown: 5,                   // Cooldown in seconds
    execute(message, args, client) {
        // Command logic here
        message.reply('Hello World!');
    },
};
```

### Slash Commands

Create a new file in `src/commands/[category]/[command]-slash.js`:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text input')
                .setRequired(true)
        ),
    category: 'category',
    async execute(interaction) {
        // Command logic here
        const text = interaction.options.getString('text');
        await interaction.reply(`You said: ${text}`);
    },
};
```

## Available Commands

- `!ping` / `/ping` - Check bot latency
- `!help` / `/help` - Show available commands

## Features

- **Modular Design**: Easy to add/remove commands
- **Dual Command Types**: Support for both prefix and slash commands
- **Error Handling**: Automatic error catching and user feedback
- **Organized Structure**: Commands grouped by category
- **Alias Support**: Multiple names for the same command
- **Cooldown System**: Prevent command spam (framework ready)
- **Auto-registration**: Slash commands automatically registered

## Getting Started

1. Make sure your bot has the necessary Discord permissions
2. Set your bot token in a `.env` file: `TOKEN=your_bot_token`
3. Run `npm start` to start the bot

## Adding New Categories

Create a new folder in `src/commands/` and organize your commands there. The command handler will automatically load all commands from all subdirectories.
