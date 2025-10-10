// Event handlers for scheduled tasks
// Each handler is imported from individual files for better organization

const sunday_downtime_selection = require('./handlers/downtime-selection');
const sunday_qotw = require('./handlers/qotw');

const handlers = {
    sunday_downtime_selection,
    sunday_qotw,
};

module.exports = handlers;
