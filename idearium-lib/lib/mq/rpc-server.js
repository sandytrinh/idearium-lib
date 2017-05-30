'use strict';

var Connection = require('./connection'),
    debug = require('debug')('idearium-lib:mq-rpc-server');

class RpcServer extends Connection {

    /**
     * Constructor function
     * @param  {String}   connectionString   Rabbitmq server url
     * @param  {String}   name               The name of the RPC server queue.
     * @param  {Function} callback           A function to be called when there is a message to process.
     * @param  {Object}   options            Rabbitmq SSL certificates see http://www.squaremobius.net/amqp.node/ssl.html for more details
     * @param  {Number}   reconnectTimeout   Timeout (milliseconds) to reconnect to rabbitmq server. Defaults to 5000
     */
    constructor(connectionString, name, callback, options, reconnectTimeout) {

        if (!connectionString) {
            throw new Error('connectionString parameter is required');
        }

        if (!name) {
            throw new Error('You must supply an RPC name');
        }

        if (!callback) {
            throw new Error('You must supply a callback function');
        }

        // Init Connection
        super(connectionString, options, reconnectTimeout);

        this.name = name;
        this.callback = callback;
        this.channel = undefined;

        // Once we have a connection to Rabbit, connect as an RPC server.
        this.on('connect', this.setupRpc);

    }

    /**
     * Connect to RabbitMQ in RPC server mode.
     * @return Promise A promise.
     */
    setupRpc () {

        // Create a channel.
        return this.connection.createChannel()
            .then((ch) => {

                // Store the channel and emit the channel connection event.
                this.channel = ch;
                this.emit('channel', this);

                // Create a queue.
                return ch.assertQueue(this.name, { durable: false });

            })
            // This will allow us to scale and start many of these if required.
            .then(() => this.channel.prefetch(1))
            .then(() => {

                debug(`Server is awaiting RPC requests [${this.name}]`);

                // Wait and respond to incoming messages.
                return this.channel.consume(this.name, (msg) => {
                    this.callback(msg, this.serverResponseHandler(msg));
                });

            })
            .catch((err) => {

                if (err.message !== 'Connection closing') {
                    throw err;
                }

            });

    }

    /**
     * Handles a response from the RPC processing function, and routes it back to the consumer.
     * @param  {[type]} msg [description]
     * @return [type]       [description]
     */
    serverResponseHandler (msg) {

        return (response) => {

            // Returns true or false
            this.channel.sendToQueue(msg.properties.replyTo, response, {
                correlationId: msg.properties.correlationId
            });

            this.channel.ack(msg);

        };

    }

}

module.exports = RpcServer;
