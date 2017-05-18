'use strict';

var url = require('url'),
    EventEmitter = require('events').EventEmitter,
    amqp = require('amqplib'),
    when = require('when'),
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
            return;
        }

        this.state = 'connecting';

        debug(`Attempting to connect at ${this.url}`);

        return amqp.connect(this.url, this.options)
        .then((conn) => {

            this.connection = conn;

            // handle disconnection error
            conn.on('error', this.disconnected);

            debug('Connected');
            this.state = 'connected';
            this.emit('connect');

        })
        .catch((err) => {

            debug('Unable to connect!');

            // Log the error.
            this.logError(err);
            this.emit('error', err);

            // Try and connect again.
            this.reconnect();

        });

        // when(amqp.connect(this.url, this.options))
        // .then((conn) => {
        //
        //     this.connection = conn;
        //
        //     // handle disconnection error
        //     conn.on('error', (err) => {
        //         debug('Disconnected!');
        //         this.logError(err);
        //         this.reconnect();
        //         this.emit('error', err);
        //     });
        //
        //     debug('Connected');
        //     this.state = 'connected';
        //     this.emit('connect');
        //
        // }, (err) => {
        //     debug('Unable to connect!');
        //     this.logError(err);
        //     this.reconnect();
        //     this.emit('error', err);
        // })
        // .catch((err) => {
        //     debug('Unexpected error.');
        //     throw err;
        // })
        // .otherwise((err) => {
        //     debug('Unexpected error.');
        //     throw err;
        // });

    }

    /**
     * Attempts reconnection to rabbitmq
     * @param  {Number} timeout Timeout (milliseconds) to reconnect. Defaults to reconnectTimeout
     */
    reconnect(timeout) {

        timeout = timeout || this.reconnectTimeout;
        debug('Reconnect in %ds', timeout / 1000);
        this.state = 'disconnected';

        setTimeout(() => this.connect(), timeout);

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
            })
            .catch(this.handleCatch);

    }

    disconnected (err) {

        debug('Disconnected!');

        // Update the state.
        this.state = 'disconnected';

        // Handle the error.
        this.logError(err);
        this.emit('error', err);

        // Because this wasn't a requested disconnection, try a reconnect.
        this.reconnect();

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

    handleCatch (err) {
        console.log('>>>>>>>>>>>>>>>>>>>');
        throw err;
    }

}

module.exports = Connection;
