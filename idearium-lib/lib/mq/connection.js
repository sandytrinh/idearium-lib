'use strict';

var url = require('url'),
    EventEmitter = require('events').EventEmitter,
    debug = require('debug')('idearium-lib:mq-connection');

class Connection extends EventEmitter {

    /**
     * Constructor function
     * @param  {String} mqUrl              RabbitMQ server mqUrl
     * @param  {Object} options            RabbitMQ server connection options
     * @param  {Number} reconnectMs   Milliseconds to wait before reconnecting.
     */
    constructor(mqUrl, options = {}, reconnectMs = 5000) {

        if (!mqUrl) {
            throw new Error('mqUrl parameter is required');
        }

        // Init EventEmitter
        super();

        // Assign arguments
        this.mqUrl = mqUrl;
        this.options = options;
        this.reconnectTimeout = reconnectMs;

        // Setup connection and state.
        this.connection = null;
        this.state = 'disconnected';

        // Support SSL based connections
        // https://help.compose.com/docs/rabbitmq-connecting-to-rabbitmq#section-node-and-rabbitmq
        if (!this.options.servername) {
            this.options.servername = url.parse(this.mqUrl).hostname;
        }

    }

}

module.exports = Connection;
