// Event handlers for scheduled tasks
// Each handler is imported from individual files for better organization

const sunday_downtime_selection = require('./handlers/downtime-selection');
const sunday_end_qotw = require('./handlers/end-qotw');
const sunday_start_qotw = require('./handlers/start-qotw');

const handlers = {
    sunday_downtime_selection,
    sunday_end_qotw,
    sunday_start_qotw,
};

module.exports = handlers;
