'use strict';

var url = require('url'),
    EventEmitter = require('events').EventEmitter,
    amqp = require('amqplib'),
    debug = require('debug')('idearium-lib:mq-client');

class Connection extends EventEmitter {

    /**
     * Constructor function
     * @param  {String} url                Rabbitmq server url
     * @param  {Object} options            Rabbitmq SSL certificates see http://www.squaremobius.net/amqp.node/ssl.html for more details
     * @param  {Number} reconnectTimeout   Timeout (milliseconds) to reconnect to rabbitmq server. Defaults to 5000
     */
    constructor(connectionString, options, reconnectTimeout) {

        if (!connectionString) {
            throw new Error('connectionString parameter is required');
        }

        // Init EventEmitter
        super();

        this.url = connectionString;
        this.options = options || {};
        this.connection = null;
        this.state = 'disconnected';
        this.reconnectTimeout = reconnectTimeout || 5000;

        // Support SSL based connections
        // https://help.compose.com/docs/rabbitmq-connecting-to-rabbitmq#section-node-and-rabbitmq
        if (!this.options.servername) {
            this.options.servername = url.parse(this.url).hostname;
        }

    }

    /**
     * Establish connection to rabbitmq and reconnects if connection failure occurs.
     */
    connect() {

        if (this.state === 'connected' || this.state === 'connecting') {
            return null;
        }

        this.state = 'connecting';

        debug(`Attempting to connect at ${this.url}`);
        return amqp.connect(this.url, this.options)
            .then((conn) => {
                this.connected(conn);
            })
            .catch((err) => {
                debug('Unable to connect!');
                this.logError(err);
                this.reconnect();
                this.emit('error', err);
            });

    }

    /**
     * Executed once connected with the connection.
     * @param  {Object} conn A connection object.
     * @return Void
     */
    connected(conn) {

        this.connection = conn;

        // handle disconnection error
        conn.on('error', (err) => {

            debug('Disconnected!');
            this.logError(err);
            this.reconnect();
            this.emit('error', err);

        });

        debug('Connected');
        this.state = 'connected';
        this.emit('connect');

    }

    /**
     * Attempts reconnection to rabbitmq
     * @param  {Number} timeout Timeout (milliseconds) to reconnect. Defaults to reconnectTimeout
     */
    reconnect(timeout) {

        timeout = timeout || this.reconnectTimeout;
        debug('Reconnect in %ds', timeout / 1000);
        this.state = 'disconnected';

        return this.delay(timeout)
            .then(() => this.connect());

    }

    /**
     * Disconnect rabbitmq connection
     */
    disconnect() {

        if (!this.connection) {
            debug('Not connected.');
            return;
        }

        debug('Disconnecting...');

        return this.connection.close()
            .then(() => {
                debug('Disconnected.');
                this.state = 'disconnected';
            });

    }

    /**
     * This is an extendable function to log errors from this client
     * @param  {Object} err Error object
     */
    logError(err) {
        // log error logics here
        // eslint-disable-next-line no-console
        console.error(err);
    }

    /**
     * A promise based variant of setTimeout.
     * @param  {Number} t The number of milliseconds to delay.
     * @return Promise    A promise which will be resolved once the timeout is complete.
     */
    delay(t) {
        return new Promise((resolve) => setTimeout(resolve, t));
    }

}

module.exports = Connection;
