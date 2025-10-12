# Bot Logging System

This Discord bot now includes comprehensive error logging to help monitor crashes and issues on your cloud server. The logging system uses Winston with daily log rotation and structured logging.

## Log Files

All logs are stored in the `logs/` directory:

- **`error-YYYY-MM-DD.log`** - Error-level logs only (rotates daily, kept for 30 days)
- **`combined-YYYY-MM-DD.log`** - All logs including info, warn, and error (rotates daily, kept for 14 days)
- **`exceptions.log`** - Uncaught exceptions (appends, no rotation)
- **`rejections.log`** - Unhandled promise rejections (appends, no rotation)
- **`pm2-combined.log`** - PM2 process logs (combined stdout/stderr)
- **`pm2-out.log`** - PM2 stdout logs
- **`pm2-error.log`** - PM2 stderr logs

## Log Levels

The bot logs at different levels:
- **ERROR**: Serious errors that need attention
- **WARN**: Warning conditions
- **INFO**: General information (command executions, scheduler events)
- **DEBUG**: Detailed debugging information (only in development)

## PM2 Management

### Starting the Bot with PM2
```bash
# Start with PM2 using the ecosystem config
pm2 start ecosystem.config.js --env production

# Or start directly
pm2 start src/index.js --name "enigma-west-marches-discord-bot"
```

### Monitoring Logs
```bash
# View real-time logs
pm2 logs enigma-west-marches-discord-bot

# View logs for a specific process
pm2 logs 0

# Monitor PM2 processes
pm2 monit
```

### Log Management Commands
```bash
# Reload logs (useful if log files were deleted)
pm2 reloadLogs

# Flush logs (clear log files)
pm2 flush

# View log files location
pm2 show enigma-west-marches-discord-bot
```

## Environment Variables

Control logging behavior with environment variables:

- **`LOG_LEVEL`**: Set logging level (`error`, `warn`, `info`, `debug`) - defaults to `info`
- **`NODE_ENV`**: Environment (`production`, `development`) - affects log formatting

## What Gets Logged

### Automatic Logging
- **Bot initialization errors**
- **Command execution** (success/failure with user context)
- **Unhandled exceptions and promise rejections**
- **Discord.js errors**
- **Scheduler events**
- **Graceful shutdowns**

### Error Context
When errors occur, logs include:
- Error message and stack trace
- User ID and Guild ID (for commands)
- Command name
- Timestamp
- Additional contextual information

## Monitoring Best Practices

### Regular Checks
1. **Daily**: Check `error-YYYY-MM-DD.log` for new errors
2. **Weekly**: Review `combined-YYYY-MM-DD.log` for patterns
3. **Monthly**: Archive old logs if needed

### Alerts (Optional)
Consider setting up alerts for:
- New files in the `logs/` directory
- Log files exceeding certain sizes
- Specific error patterns

### Log Analysis
```bash
# Count errors by day
grep "ERROR" logs/error-*.log | grep -o "2024-[0-9][0-9]-[0-9][0-9]" | sort | uniq -c

# Find most common errors
grep "ERROR" logs/error-*.log | grep -o "Error: [^|]*" | sort | uniq -c | sort -nr | head -10

# Check for command failures
grep "Command execution failed" logs/combined-*.log
```

## Troubleshooting

### No Logs Appearing
1. Check if the `logs/` directory exists and is writable
2. Verify PM2 is running the correct process
3. Check PM2 logs: `pm2 logs`

### Logs Too Large
- Logs automatically rotate daily
- Adjust retention periods in `src/utils/logger.js` if needed
- Use `pm2 flush` to clear PM2 logs manually

### Missing Error Details
- Ensure `LOG_LEVEL` is set appropriately
- Check that error handlers are properly catching exceptions
- Review the logger configuration in `src/utils/logger.js`

## Development vs Production

- **Development**: Colored console output, debug level logging
- **Production**: File-only logging, info level and above

The logger automatically detects the environment and adjusts formatting accordingly.
