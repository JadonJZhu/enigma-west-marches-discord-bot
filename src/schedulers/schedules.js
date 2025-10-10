// Configuration for all scheduled events
// Each schedule object defines when and what to execute

const schedules = [
    {
        name: 'sunday_downtime_selection',
        cronExpression: '00 12 * * 0', // Sunday 12:00 PM
        timezone: 'America/Los_Angeles',
        description: 'Weekly Sunday downtime selection messages',
        enabled: true
    },
    {
        name: 'sunday_qotw',
        cronExpression: '00 12 * * 0', // Sunday 12:00 PM
        timezone: 'America/Los_Angeles',
        description: 'Weekly Sunday Question of the Week',
        enabled: true
    },
];

module.exports = schedules;
