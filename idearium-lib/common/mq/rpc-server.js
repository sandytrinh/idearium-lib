'use strict';

var mq = require('../../lib/mq'),
    config = require('../config'),
    certs = require('./certs');

/**
 * A common implement of mq.RPC to be used across many clients.
 */
class RpcServer extends mq.RpcServer {

    constructor(name, callback) {

        // Make sure we have a URL to connect to RabbitMQ.
        if (!config.get('mqUrl')) {
            throw new Error('The RabbitMQ connection url must be provided in an environment variable called mqUrl.');
        }

        // Make sure we have a URL to connect to RabbitMQ.
        if (!name) {
            throw new Error('The RabbitMQ server queue name must be provided.');
        }

        // Make sure we have a callback.
        if (!callback) {
            throw new Error('A callback function must be provided.');
        }

        // Configure the MqClient class.
        super(config.get('mqUrl'), name, callback);

        // We'll customise the reconnection strategy from MqClient.
        this.reconnectCount = 0;

        // Once the certs have loaded, we'll update the options and connect.
        certs.
            then(this.makeConnection.bind(this));

    }

    /**
     * This is merge the optionsCerts argument into this.options and
     * attempt to make a connection to Rabbit.
     * @param  {Object} optionsCerts Any certs required for connection.
     * @return Void
     */
    makeConnection (optionsCerts) {

        // Update options (for RabbitMQ connection) without certs.
        Object.assign(this.options, optionsCerts || {});

        // Connect even if there was an ENOENT error.
        this.connect();

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

module.exports = RpcServer;
