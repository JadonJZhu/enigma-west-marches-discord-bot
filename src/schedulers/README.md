# Scheduler Module

This module provides a flexible and organized way to manage scheduled events for the Discord bot.

## Structure

- `scheduler.js` - Main scheduler class that manages cron jobs
- `schedules.js` - Configuration file defining all scheduled events
- `handlers.js` - Event handler functions for each scheduled task

## How to Add a New Scheduled Event

### 1. Define the Schedule

Add a new object to the `schedules` array in `schedules.js`:

```javascript
{
    name: 'my_new_event',           // Unique identifier
    cronExpression: '0 9 * * 1',    // Cron expression (Monday 9 AM)
    timezone: 'America/New_York',   // Timezone (optional, defaults to UTC)
    description: 'My new scheduled event', // Description for logging
    enabled: true                   // Whether to schedule this event
}
```

### 2. Create the Handler

Add a new async function to the `handlers` object in `handlers.js`:

```javascript
async my_new_event(client) {
    try {
        // Your event logic here
        const channel = await client.channels.fetch('YOUR_CHANNEL_ID');
        await channel.send('Hello from scheduled event!');
        console.log('My new event executed successfully');
    } catch (error) {
        console.error('Error in my_new_event:', error);
    }
}
```

## Cron Expression Examples

- `'0 9 * * *'` - Daily at 9:00 AM
- `'0 */2 * * *'` - Every 2 hours
- `'0 9 * * 1'` - Every Monday at 9:00 AM
- `'30 16 * * 2'` - Every Tuesday at 4:30 PM
- `'0 0 1 * *'` - First day of every month at midnight

## Timezone Support

The scheduler supports timezones using the IANA timezone database format:

- `'America/New_York'`
- `'America/Los_Angeles'`
- `'Europe/London'`
- `'UTC'`

## Available Methods

### Scheduler Instance Methods

- `start()` - Starts all enabled scheduled events
- `stop()` - Stops all running scheduled tasks
- `addSchedule(schedule)` - Adds a new schedule at runtime
- `removeSchedule(name)` - Removes a schedule by name
- `listSchedules()` - Returns array of all configured schedules
- `getSchedule(name)` - Returns a specific schedule configuration

## Example: Adding a Daily Backup

1. In `schedules.js`:
```javascript
{
    name: 'daily_backup',
    cronExpression: '0 2 * * *',
    timezone: 'UTC',
    description: 'Daily data backup at 2 AM UTC',
    enabled: true
}
```

2. In `handlers.js`:
```javascript
async daily_backup(client) {
    try {
        console.log('Starting daily backup...');
        // Implement your backup logic here
        console.log('Daily backup completed successfully');
    } catch (error) {
        console.error('Error during daily backup:', error);
    }
}
```

The scheduler will automatically pick up the new event when the bot restarts, or you can call `addSchedule()` at runtime for immediate scheduling.
