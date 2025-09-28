// Configuration for all scheduled events
// Each schedule object defines when and what to execute

const schedules = [
    {
        name: 'sunday_downtime_selection',
        cronExpression: '20 12 * * 0', // Sunday 12:00 PM
        timezone: 'America/Los_Angeles',
        description: 'Weekly Sunday downtime selection messages',
        enabled: true
    },
    {
        name: 'sunday_qotw',
        cronExpression: '21 12 * * 0', // Sunday 12:00 PM
        timezone: 'America/Los_Angeles',
        description: 'Weekly Sunday Question of the Week',
        enabled: true
    },
    // Example schedules for future use:
    /*
    {
        name: 'daily_backup',
        cronExpression: '0 2 * * *', // Daily at 2 AM
        timezone: 'UTC',
        description: 'Daily data backup',
        enabled: true
    },
    {
        name: 'weekly_report',
        cronExpression: '0 9 * * 1', // Monday 9 AM
        timezone: 'America/New_York',
        description: 'Weekly status report',
        enabled: true
    },
    {
        name: 'monthly_maintenance',
        cronExpression: '0 3 1 * *', // 1st of month at 3 AM
        timezone: 'UTC',
        description: 'Monthly maintenance tasks',
        enabled: false // Disabled for now
    }
    */
];

module.exports = schedules;
