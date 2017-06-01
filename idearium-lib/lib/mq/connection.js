'use strict';

var url = require('url'),
    EventEmitter = require('events').EventEmitter,
    amqp = require('amqplib'),
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

    /**
     * Establish a connection to RabbitMQ and attempt to reconnect if it fails.
     * @return {Void}
     */
    connect() {

        // We don't need to connect if we already are.
        if (this.state === 'connected' || this.state === 'connecting') {
            return;
        }

        // Update the state
        this.state = 'connecting';

        debug(`Attempting to connect at ${this.url}`);

        // Start connecting
        amqp.connect(this.mqUrl, this.options)
            .then(conn => {

                // handle disconnection error
                conn.on('error', err => this.connectionError(err, 'Disconnected!', true));

                this.hasConnected(conn);

            }, err => this.connectionError(err, `Can't to connect to ${this.mqUrl}`, true))
            .catch(err => this.connectionError(err, `Unable to connect to ${this.mqUrl}`, true));

    }

    /**
     * Should be called with a connection.
     * @private
     * @param  {Object} conn A RabbitMQ connection.
     * @return {Void}
     */
    hasConnected(conn) {

        // Store the connection and status
        debug('Connected');
        this.state = 'connected';
        this.connection = conn;

        // Announce we're connected.
        this.emit('connect', this.connection);

    }

    /**
     * Attempts to reconnect to RabbitMQ.
     * @private
     * @param  {Number} [timeout=this.reconnectTimeout] The time to pass before attempting reconnection.
     * @return {Void}
     */
    reconnect(timeout = this.reconnectTimeout) {

        debug(`Reconnect in ${timeout/1000}`);

        // Update our state.
        this.state = 'disconnected';

        // Connect again at the appropriate time.
        setTimeout(this.connect.bind(this), timeout);

    }

    /**
     * Disconnect from RabbitMQ.
     * @return {Promose}
     */
    /**
     * Disconnection from RabbitMQ.
     * @return {Promise} Resolves when we've disconnected.
     */
    disconnect() {

        // Don't attempt if we don't have a connection.
        if (!this.connection) {
            return Promise.resolved();
        }

        debug('Disconnecting...');

        return this.connection.close()
            .then(this.hasDisconnected.bind(this));

    }

    /**
     * Should be called when we've disconnected (as called, not in error).
     * @private
     * @return {Void}
     */
    hasDisconnected() {

        debug('Disconnected.');

        // Update the state.
        this.state = 'disconnected';

        // Announce we're connected.
        this.emit('disconnect');

    }

    /**
     * Handle an announce a connection error.
     * @private
     * @param  {Error}  err                The error that occured
     * @param  {String}  msg               A message for the debug output.
     * @param  {Boolean} [reconnect=false] Should we setup a reconnect?
     * @return {Void}
     */
    connectionError(err, msg, rc = false) {

        // Log it
        debug(msg);
        this.logError(err);

        // Optionally, attempt to reconnect.
        if (rc) {
            this.reconnect();
        }

        // Announce the error.
        this.emit('error', err);

    }

    /**
     * This is an extendable function to log errors from this client
     * @private
     * @param  {Object} err Error object
     */
    logError(err) {
        // log error logics here
        // eslint-disable-next-line no-console
        console.error(err);
    }

}

module.exports = Connection;
