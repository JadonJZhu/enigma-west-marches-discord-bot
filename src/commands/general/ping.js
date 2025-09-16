module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    aliases: ['pong', 'latency'],
    usage: '!ping',
    category: 'general',
    cooldown: 5, // seconds
    execute(message, args, client) {
        const sent = Date.now();
        message.reply('Pong!').then(sentMessage => {
            const timeDiff = Date.now() - sent;
            sentMessage.edit(`Pong! 🏓\nLatency: ${timeDiff}ms\nAPI Latency: ${Math.round(client.ws.ping)}ms`);
        });
    },
};
