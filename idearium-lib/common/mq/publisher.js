'use strict';

const log = require('../log')('idearium-lib:common:mq/publisher');
const mqManager = require('./messages');
const { hasProperty } = require('../../lib/util');

class Publisher {

    constructor(messagesPath) {
        this.messagesPath = messagesPath;
    }

    /**
     * Check if a RabbitMQ message exists before publishing.
     * @param {String} type Message type.
     * @param {Object} data Message data.
     * @return {Void} Publishes the message.
     */
    publish (type, data) {

        if (!hasProperty(this.messagesPath, type)) {
            return log.error(`Message of type: ${type} not found`);
        }

        // Publish the message.
        mqManager.publish(type, data);

        return log.debug({ data, type }, `Publishing message of type: ${type}`);

    }

}

module.exports = Publisher;
