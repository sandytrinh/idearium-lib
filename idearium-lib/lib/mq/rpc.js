'use strict';

var Connection = require('./connection'),
    debug = require('debug')('idearium-lib:mq-rpc');

class RPC extends Connection {

    /**
     * Constructor function
     * @param  {String} url                Rabbitmq server url
     * @param  {Object} options            Rabbitmq SSL certificates see http://www.squaremobius.net/amqp.node/ssl.html for more details
     * @param  {Number} publishConcurrency Number of messages to publish concurrently. Defaults to 3.
     * @param  {Number} queueTimeout       Timeout (milliseconds) for re-queuing publish and consumer tasks. Defaults to 5000
     * @param  {Number} reconnectTimeout   Timeout (milliseconds) to reconnect to rabbitmq server. Defaults to 5000
     */
    constructor(connectionString, type, options, reconnectTimeout) {

        if (!connectionString) {
            throw new Error('connectionString parameter is required');
        }

        if (type === 'server' && !(options || {}).name) {
            throw new Error('You must supply an RPC name in the options object, when type is server.');
        }

        // Init Connection
        super(connectionString, options, reconnectTimeout);

        this.type = type;
        this.channel = undefined;

        this.on('connect', () => {

            if (this.type === 'server') {
                this.connectAsServer();
            }

        });

    }

    connectAsServer () {

        // Create a channel.
        this.connection.createChannel()
            .then((ch) => {

                // Store the channel and emit the channel connection event.
                this.channel = ch;
                this.emit('channel', this);

                // Create a queue.
                return ch.assertQueue(this.options.name, { durable: false });

            })
            // This will allow us to scale and start many of these if required.
            .then(() => this.channel.prefetch(1))
            .then(() => {

                debug(`Server is awaiting RPC requests [${this.options.name}]`);

                // Wait and respond to incoming messages.
                return this.channel.consume(this.options.name, (msg) => {
                    this.options.callback(msg, this.serverResponseHandler(msg));
                });

            })
            .catch((err) => {
                if (err.message !== 'Connection closing') {
                    throw err;
                }
            });

    }

    serverResponseHandler (msg) {

        return (response) => {

            this.channel
                .sendToQueue(msg.properties.replyTo, response, {
                    correlationId: msg.properties.correlationId
                })
                .then(() => this.channel.ack(msg))
                .catch(this.handleCatch);

            // this.channel.ack(msg)
            //     .catch(this.handleCatch);

        }

    }

    handleCatch (err) {
        throw err;
    }

}

module.exports = RPC;
