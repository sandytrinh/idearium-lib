'use strict';

var url = require('url'),
    EventEmitter = require('events').EventEmitter,
    amqp = require('amqplib'),
    debug = require('debug')('idearium-lib:mq-connection');

/**
* Utility class to create a RabbitMQ connection.
* @constructor
* @extends EventEmitter
* @param  {String} connectionString   Rabbitmq server url
* @param  {Object} options            Rabbitmq SSL certificates see http://www.squaremobius.net/amqp.node/ssl.html for more details
* @param  {Number} reconnectTimeout   Timeout (milliseconds) to reconnect to rabbitmq server. Defaults to 5000
*/
class Connection extends EventEmitter {

    constructor(connectionString, options = {}, reconnectTimeout = 5000) {

        if (!connectionString) {
            throw new Error('connectionString parameter is required');
        }

        // Init EventEmitter
        super();

        this.url = connectionString;
        this.options = options;
        this.reconnectTimeout = reconnectTimeout;
        this.connection = null;
        this.state = 'disconnected';

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
            .then(conn => this.connected(conn))
            .catch((err) => {

                // This is a bit ugly, but when connecting to RabbitMQ (with SSL)
                // older versions can throw some weird errors.
                // This tidies up a really persistent one that seems to happen on every connect.
                if (err.message && !err.message.startsWith('socket hang up')) {

                    debug('Unable to connect!');
                    this.logError(err);
                    this.emit('error', err);

                }

                return this.reconnect();

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
            this.emit('error', err);

            return this.reconnect();

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

        const DISCONNECTING = 'disconnecting';

        if (!this.connection) {
            debug('Not connected.');
            return;
        }

        // If we're already disconnecting, just ignore this.
        if (this.state === DISCONNECTING) {
            return;
        }

        debug('Disconnecting...');

        this.state = DISCONNECTING;

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

    /**
     * Given an error from a `.catch`, throw it.
     * @param  {error} err The Error object to throw.
     * @return Void
     */
    handleCatch (err) {
        throw err;
    }

}

module.exports = Connection;
