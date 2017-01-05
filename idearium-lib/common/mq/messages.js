'use strict';

const path = require('path'),
    mq = require('../../lib/mq'),
    manager = new mq.Manager(path.join(process.cwd(), 'messages'));

// Once the messages have been loaded, register the consumers.
manager.addListener('load', () => {
    manager.registerConsumers();
});

// Export the instantiated class.
module.exports = manager;
