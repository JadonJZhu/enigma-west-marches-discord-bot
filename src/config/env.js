function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function getOptionalEnv(name) {
    return process.env[name] || null;
}

module.exports = {
    get GUILD_ID() {
        return getRequiredEnv('GUILD_ID');
    },
    get OWNER_ID() {
        return getRequiredEnv('OWNER_ID');
    },
    get QOTW_CHANNEL_ID() {
        return getRequiredEnv('QOTW_CHANNEL_ID');
    },
    get DOWNTIME_CHANNEL_ID() {
        return getRequiredEnv('DOWNTIME_CHANNEL_ID');
    },
    get BOT_UPDATES_CHANNEL_ID() {
        return getOptionalEnv('BOT_UPDATES_CHANNEL_ID');
    }
};
