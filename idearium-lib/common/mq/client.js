'use strict';

var config = require('../config'),
    mq = require('../../lib/mq'),
    certs = require('./certs');

/**
 * A common implement of mq.Client to be used across many clients.
 */
class Client extends mq.Client {

    constructor(url) {

        // Make sure we have a URL to connect to RabbitMQ.
        if (!url) {
            throw new Error('The RabbitMQ connection url must be provided.');
        }

        // Configure the MqClient class.
        super(url);

        // We'll customise the reconnection strategy from MqClient.
        this.reconnectCount = 0;

        // Once the certs have loaded, we'll update the options and connect.
        certs.
            then((optionsCerts) => {

                // Update options (for RabbitMQ connection) without certs.
                Object.assign(this.options, optionsCerts);

                // Connect even if there was an ENOENT error.
                this.connect();

            });

    }

    //
    // Overwrite MqClient class methods.
    //

    // Log using debug.
    logError(err) {
        // eslint-disable-next-line no-console
        console.error(err.toString());
    }

    // Customise the reconnect timeout based on connection attempts.
    reconnect() {

        // set timeout to the power of 2
        super.reconnect(parseInt(Math.pow(2, this.reconnectCount++)) * 1000);

    }

}

module.exports = new Client(config.get('mqUrl'));
