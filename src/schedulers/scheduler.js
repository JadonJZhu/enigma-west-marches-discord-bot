const cron = require('node-cron');
const schedules = require('./schedules');
const handlers = require('./handlers');

class Scheduler {
    constructor(client) {
        this.client = client;
        this.scheduledTasks = [];
    }

    start() {
        console.log('Starting scheduler...');

        // Schedule all defined events
        schedules.forEach(schedule => {
            if (schedule.enabled) {
                this.scheduleEvent(schedule);
            }
        });

        console.log(`Scheduler started successfully with ${this.scheduledTasks.length} active tasks`);
    }

    // Generic method to schedule any event
    scheduleEvent(schedule) {
        try {
            const handler = handlers[schedule.name];
            if (!handler) {
                console.error(`No handler found for schedule: ${schedule.name}`);
                return;
            }

            const task = cron.schedule(schedule.cronExpression, () => {
                handler(this.client);
            }, {
                timezone: schedule.timezone || 'UTC'
            });

            this.scheduledTasks.push({
                name: schedule.name,
                task: task
            });

            console.log(`Scheduled: ${schedule.name} (${schedule.cronExpression}) - ${schedule.description || ''}`);
        } catch (error) {
            console.error(`Failed to schedule ${schedule.name}:`, error);
        }
    }

    // Utility methods
    addSchedule(schedule) {
        // Note: This adds to the imported schedules array, but changes won't persist
        // For persistent changes, modify the schedules.js file directly
        schedules.push(schedule);
        if (schedule.enabled !== false) {
            this.scheduleEvent(schedule);
        }
    }

    removeSchedule(name) {
        // Find and stop the running task
        const taskIndex = this.scheduledTasks.findIndex(t => t.name === name);
        if (taskIndex > -1) {
            this.scheduledTasks[taskIndex].task.stop();
            this.scheduledTasks.splice(taskIndex, 1);
        }

        // Note: This modifies the imported schedules array, but changes won't persist
        // For persistent changes, modify the schedules.js file directly
        const scheduleIndex = schedules.findIndex(s => s.name === name);
        if (scheduleIndex > -1) {
            schedules.splice(scheduleIndex, 1);
        }
    }

    listSchedules() {
        return schedules.map(schedule => ({
            name: schedule.name,
            cronExpression: schedule.cronExpression,
            timezone: schedule.timezone,
            description: schedule.description,
            enabled: schedule.enabled
        }));
    }

    getSchedule(name) {
        return schedules.find(s => s.name === name);
    }

    stop() {
        console.log('Stopping scheduler...');
        this.scheduledTasks.forEach(({ task }) => task.stop());
        this.scheduledTasks = [];
        console.log('Scheduler stopped');
    }
}

module.exports = Scheduler;
