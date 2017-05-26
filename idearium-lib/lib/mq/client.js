'use strict';

var url = require('url'),
    async = require('async'),
    debug = require('debug')('idearium-lib:mq-client'),
    Connection = require('./connection');

/**
* RabbitMQ Client.
* @constructor
* @extends Connection
* @param  {String} url                Rabbitmq server url
* @param  {Object} options            Rabbitmq SSL certificates see http://www.squaremobius.net/amqp.node/ssl.html for more details
* @param  {Number} publishConcurrency Number of messages to publish concurrently. Defaults to 3.
* @param  {Number} queueTimeout       Timeout (milliseconds) for re-queuing publish and consumer tasks. Defaults to 5000
* @param  {Number} reconnectTimeout   Timeout (milliseconds) to reconnect to rabbitmq server. Defaults to 5000
*/
class Client extends Connection {

    constructor(connectionString, options, publishConcurrency, queueTimeout, reconnectTimeout) {

        if (!connectionString) {
            throw new Error('connectionString parameter is required');
        }

        // Init EventEmitter
        super(connectionString, options, reconnectTimeout);

        this.consumerQueue = [];
        this.publishConcurrency = publishConcurrency || 3;
        this.publisherQueue = async.queue(this.iteratePublisherQueue.bind(this), this.publishConcurrency);
        this.pausePublisherQueue();
        this.queueTimeout = queueTimeout || 5000;

        // Support SSL based connections
        // https://help.compose.com/docs/rabbitmq-connecting-to-rabbitmq#section-node-and-rabbitmq
        if (!this.options.servername) {
            this.options.servername = url.parse(this.url).hostname;
        }

        this.on('connect', () => {

            this.resumePublisherQueue();
            this.registerConsumers();

        });

    }

    /**
     * Attempts reconnection to rabbitmq
     * @param  {Number} timeout Timeout (milliseconds) to reconnect. Defaults to reconnectTimeout
     */
    reconnect(timeout) {

        // Pause the queue for now.
        this.pausePublisherQueue();

        // Super functionality.
        return super.reconnect(timeout);


    }

    /**
     * Disconnect rabbitmq connection
     */
    disconnect() {

        // Super functionality.
        super.disconnect();

        // Pause the queue for now.
        this.pausePublisherQueue();

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

                // execute publish function (`fn` returns a function).
                return fn(ch)
                    .then(() => ch.close());

            })
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

                return this.delay(this.queueTimeout)
                    .then(() => this.publish(fn));

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
        return this.registerConsumer(fn);

    }

    /**
     * Process consumer queue
     */
    registerConsumers() {

        debug('Registering %d consumers', this.consumerQueue.length);

        return Promise.all(this.consumerQueue.map(fn => this.registerConsumer(fn)));

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

                return this.delay(this.queueTimeout)
                    .then(() => this.registerConsumer(fn));

            }

        };

        return this.connection.createChannel()
            .then((ch) => {

                // handle channel disconnection error
                ch.on('error', cb);

                // execute consume function (`fn` returns a promise)
                return fn(ch);

            })
            .catch(cb);

    }

}

module.exports = Client;
