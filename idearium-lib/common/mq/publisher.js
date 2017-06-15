'use strict';

const manager = require('./messages');
const { hasProperty } = require('../../lib/util');
const log = require('../log')('idearium-lib:common:mq/publisher');

/**
 * Check if a RabbitMQ message exists before publishing.
 * @param {String} type Message type.
 * @param {Object} data Message data.
 * @return {Void} Publishes the message.
 */
const publish = (type, data) => {

    if (!hasProperty(manager.messages, type)) {
        return log.error(`Message of type: ${type} not found`);
    }

    // Publish the message.
    manager.messages[type].publish(data);

    return log.debug({ data, type }, `Publishing message of type: ${type}`);

}

module.exports = publish;
