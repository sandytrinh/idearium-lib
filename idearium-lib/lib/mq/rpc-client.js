'use strict';

var uuid = require('uuid'),
    Connection = require('./connection'),
    debug = require('debug')('idearium-lib:mq-rpc-client');

class RpcClient extends Connection {

    /**
     * Constructor function
     * @param  {String}   connectionString   Rabbitmq server url
     * @param  {Object}   options            Rabbitmq SSL certificates see http://www.squaremobius.net/amqp.node/ssl.html for more details
     * @param  {Number}   rpcTimeout   Timeout (milliseconds), which if reached, the RPC will be considered failed. Defaults to 5000
     * @param  {Number}   reconnectTimeout   Timeout (milliseconds) to reconnect to rabbitmq server. Defaults to 5000
     */
    constructor(connectionString, options, rpcTimeout = 5000, reconnectTimeout) {

        if (!connectionString) {
            throw new Error('connectionString parameter is required');
        }

        // Init Connection
        super(connectionString, options, reconnectTimeout);

        this.promises = {};
        this.channel = undefined;
        this.queue = undefined;
        this.rpcTimeout = rpcTimeout;

        // Once we have a connection to Rabbit, connect as an RPC server.
        this.on('connect', this.setupRpc);

    }

    /**
     * An internal function to connect to RabbitMQ in RPC server mode.
     * @return Promise A promise.
     */
    setupRpc() {

        // Create a channel.
        return this.connection.createChannel()
            .then((ch) => {

                // Store the channel and emit the channel connection event.
                this.channel = ch;
                this.emit('channel', this);

                // Create a queue.
                return ch.assertQueue('', { exclusive: true });

            })
            .then((q) => {

                debug(`RPC client is awaiting publishing requests [${q.queue}]`);

                // Store the queue and emit the queue connection event.
                this.queue = q;
                this.emit('queue', this);

                return this.setupConsumer();

            })
            .catch((err) => {

                if (err.message !== 'Connection closing') {
                    throw err;
                }

            });

    }

    /**
     * Used to publish a message to an RPC.
     * @param  {String} rpcName The name of the RPC.
     * @param  {Object} data    The data to send to the RPC.
     * @param  {Object} timeout The specific timeout for the RPC. Defaults to `this.timeout`.
     * @return {Promise}        A promise that will be resolved with the result.
     */
    publish(rpcName, data, timeout = this.rpcTimeout) {

        // Use the promiseManager to map promises specific to correlationIds.
        return new Promise((resolve, reject) => this.promiseManager(rpcName, uuid.v4(), data, timeout, resolve, reject));

    }

    /**
     * An internal method used to store a promise, against a correlationId, and then publish the data to the RPC.
     * @param  {String} rpcName  The name of the RPC.
     * @param  {String} correlationId A v4 uuid used to correlate incoming messages to promises.
     * @param  {Object} data          The data to send to the RPC.
     * @param  {Function} resolve     The resolve function of a Promise.
     * @param  {Function} reject      The reject function of a Promise.
     * @return Void
     */
    promiseManager(rpcName, correlationId, data, timeout, resolve, reject) {

        // Allow 2000 milliseconds for the RPC to work.
        const timeoutId = setTimeout(() => {
            reject(new Error(`RPC timed out (${rpcName}, ${timeout})`))
        }, timeout);

        this.promises[correlationId] = { resolve, reject, timeoutId };

        // Send a message to the server
        this.channel.sendToQueue(rpcName, new Buffer(JSON.stringify(data)), {
            correlationId,
            replyTo: this.queue.queue
        });

    }

    /**
     * Used to setup a consumer to handle responses from RPCs.
     * It will use the messages correlationId to find a Promise stored on this class in which to resolve.
     * @return {Promise} A Promise that will be resolved once the consume has been setup.
     */
    setupConsumer() {

        // Setup a consumer for the queue.
        // Determine if there is a promise we need to resolve based on the correlationId.
        return this.channel.consume(this.queue.queue, (msg) => {

            const correlation = this.promises[msg.properties.correlationId];

            // If we don't have a correlation, simply ignore this.
            if (!correlation) {
                debug('correlationId %s not found', msg.properties.correlationId);
                return;
            }

            // Clear the timeout for the correlation.
            clearTimeout(correlation.timeoutId);

            // Delete the correlation from the promises store we've resolve it.
            delete this.promises[msg.properties.correlationId];

            // Resolve the promise
            correlation.resolve(msg);

        }, {
            noAck: true
        });

    }

}

module.exports = RpcClient;
