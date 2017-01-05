'use strict';

var EventEmitter = require('events').EventEmitter,
    amqp = require('amqplib'),
    when = require('when'),
    async = require('async'),
    debug = require('debug')('idearium-lib:mq-client');

class Client extends EventEmitter {

    /**
     * Constructor function
     * @param  {String} url                Rabbitmq server url
     * @param  {Object} options            Rabbitmq SSL certificates see http://www.squaremobius.net/amqp.node/ssl.html for more details
     * @param  {Number} publishConcurrency Number of messages to publish concurrently. Defaults to 3.
     * @param  {Number} queueTimeout       Timeout (milliseconds) for re-queuing publish and consumer tasks. Defaults to 5000
     * @param  {Number} reconnectTimeout   Timeout (milliseconds) to reconnect to rabbitmq server. Defaults to 5000
     */
    constructor(url, options, publishConcurrency, queueTimeout, reconnectTimeout) {

        if (!url) {
            throw new Error('url parameter is required');
        }

        // Init EventEmitter
        super();

        this.url = url;
        this.options = options || {};
        this.consumerQueue = [];
        this.publishConcurrency = publishConcurrency || 3;
        this.publisherQueue = async.queue(this.iteratePublisherQueue.bind(this), this.publishConcurrency);
        this.pausePublisherQueue();
        this.connection = null;
        this.state = 'disconnected';
        this.queueTimeout = queueTimeout || 5000;
        this.reconnectTimeout = reconnectTimeout || 5000;

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

        when(amqp.connect(this.url, this.options))
        .then((conn) => {

            // handle disconnection error
            conn.on('error', (err) => {
                debug('Disconnected!');
                this.logError(err);
                this.reconnect();
                this.emit('error', err);
            });

            debug('Connected');
            this.state = 'connected';
            this.connection = conn;
            this.resumePublisherQueue();
            this.registerConsumers();
            this.emit('connect');

        }, (err) => {
            debug('Unable to connect!');
            this.logError(err);
            this.reconnect();
            this.emit('error', err);
        })
        .otherwise((err) => {
            debug('Unexpected error.');
            throw err;
        });

    }

    /**
     * Attempts reconnection to rabbitmq
     * @param  {Number} timeout Timeout (milliseconds) to reconnect. Defaults to reconnectTimeout
     */
    reconnect(timeout) {

        timeout = timeout || this.reconnectTimeout;
        debug('Reconnect in %ds', timeout / 1000);
        this.pausePublisherQueue();
        this.state = 'disconnected';

        setTimeout(() => { this.connect(); }, timeout);

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
        this.pausePublisherQueue();
        this.connection.close().then(() => {
            debug('Disconnected.');
            this.state = 'disconnected';
        });

    }

    /**
     * Resume publisher queue
     */
    resumePublisherQueue() {

        this.publisherQueue.resume();

    }

    /**
     * Pause publisher queue
     */
    pausePublisherQueue() {

        this.publisherQueue.pause();

    }

    /**
     * Publish message to rabbitmq
     * @param  {Function} fn Publisher function
     * @param  {Function} cb Publisher callback
     */
    iteratePublisherQueue(fn, cb) {

        if (!this.connection) {
            return cb(new Error('Unable to iterate publisher queue, no connection.'));
        }

        when(this.connection.createChannel())
        .then((ch) => {
            // handle channel disconnection error
            ch.on('error', cb);
            // execute publish function
            when(fn(ch))
            .then(() => ch.close())
            .then(cb)
            .otherwise(cb);
        }, cb)
        .otherwise(cb);

    }

    /**
     * Add a message to publisher queue
     * @param  {Function} fn Publisher function
     */
    publish(fn) {

        this.publisherQueue.push(fn, (err) => {

            if (err) {
                this.logError(err);
                debug('Unable to register a publisher, re-queue publisher in ' + this.queueTimeout / 1000 + 's');
                // re-queue in 5 seconds
                setTimeout(() => { this.publish(fn); }, this.queueTimeout);
            }

        });

        if (!this.connection) {
            return this.connect();
        }

    }

    /**
     * Add consumer to consumer queue
     * @param  {Function} fn Consumer function
     */
    consume(fn) {

        // add to this queue, this queue will be used to re-register the consumers when connection failed
        this.consumerQueue.push(fn);
        this.registerConsumer(fn);

    }

    /**
     * Process consumer queue
     */
    registerConsumers() {

        this.consumerQueue.forEach((fn) => {
            this.registerConsumer(fn);
        });

        debug('Registered %d consumers', this.consumerQueue.length);

    }

    /**
     * Register consumer function into rabbitmq
     * @param  {Function} fn Consumer function
     */
    registerConsumer(fn) {

        if (!this.connection) {
            return this.connect();
        }

        var cb = (err) => {
            if (err) {
                this.logError(err);
                debug('Unable to register a consumer, re-queue consumer in ' + this.queueTimeout / 1000 + 's');
                // re-queue in 5 seconds
                setTimeout(() => { this.registerConsumer(fn); }, this.queueTimeout);
            }
        };

        when(this.connection.createChannel())
        .then((ch) => {
            // handle channel disconnection error
            ch.on('error', cb);
            // execute consume function
            when(fn(ch))
            .otherwise(cb);
        }, cb)
        .otherwise(cb);

    }

    /**
     * This is an extendable function to log errors from this client
     * @param  {Object} err Error object
     */
    logError(err) {
        // log error logics here
        console.error(err);
    }

}

module.exports = Client;
