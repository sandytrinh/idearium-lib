'use strict';

var async = require('async'),
    Connection = require('./connection'),
    debug = require('debug')('idearium-lib:mq-client');

class Client extends Connection {

    /**
     * Constructor function
     * @param  {String} mqUrl              RabbitMQ server url.
     * @param  {Object} options            RabbitMQ server connection options (inc SSL certs).
     * @param  {Number} publishConcurrency Number of messages to publish concurrently. Defaults to 3.
     * @param  {Number} reQueueMs       Milliseconds to wait before re-queuing publish and consumer tasks. Defaults to 5000
     * @param  {Number} reconnectMs   Milliseconds to wait before reconnecting. Defaults to 5000
     */
    constructor(mqUrl, options = {}, publishConcurrency = 3, reQueueMs = 5000, reconnectMs = 5000) {

        if (!mqUrl) {
            throw new Error('mqUrl parameter is required');
        }

        // Init Connection.
        super(mqUrl, options, reconnectMs);

        // Parse arguments
        this.url = mqUrl;
        this.options = options;
        this.queueMs = reQueueMs;
        this.reconnectTimeout = reconnectMs;

        // Setup the internal queues.
        this.consumerQueue = [];
        this.publishConcurrency = publishConcurrency;
        this.publisherQueue = async.queue(this.iteratePublisherQueue.bind(this), this.publishConcurrency);

        // Pause everything, as we're not connected yet.
        this.pausePublisherQueue();

    }

    /**
     * Establish a connection to RabbitMQ and attempt to reconnect if it fails.
     * @override
     * @return {Void}
     */
    hasConnected(conn) {

        super.hasConnected(conn);

        this.resumePublisherQueue();
        this.registerConsumers();

    }

    /**
     * Attempts reconnection to rabbitmq.
     * @override
     * @param  {Number} timeout Timeout (milliseconds) to reconnect. Defaults to reconnectTimeout
     */
    reconnect(timeout = this.reconnectTimeout) {

        super.reconnect(timeout);

        // Pause the publisher queue.
        this.pausePublisherQueue();

    }

    /**
     * Disconnect rabbitmq connection
     */
    disconnect() {

        // Pause the publisher queue.
        this.pausePublisherQueue();

        return super.disconnect();

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

        this.connection.createChannel()
        .then((ch) => {

            // handle channel disconnection error
            ch.on('error', cb);

            // execute publish function
            fn(ch)
                .then(() => ch.close())
                .then(cb)
                .catch(cb);

        }, cb)
        .catch(cb);

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

        this.connection.createChannel()
            .then((ch) => {

                // handle channel disconnection error
                ch.on('error', cb);

                // execute consume function
                fn(ch)
                    .catch(cb);

            }, cb)
            .catch(cb);

    }

}

module.exports = Client;
