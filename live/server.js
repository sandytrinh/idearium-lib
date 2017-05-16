/* eslint-disable no-console */

'use strict';

const mqClient = require('../idearium-lib/common/mq/client');

/**
 * A function that given a channel, will return another function to process a message.
 * @param  {Object}   ch A RabbitMQ channel.
 * @return {Function}    A function that will process a message. Pass it to `ch.consume`.
 */
const reply = (ch) => (msg) => {

    console.log('Processing incoming message:');
    console.log(JSON.parse(msg.content.toString()));
    console.log('');

    // Determine the response for the message.
    // Simply echo back what we received.
    const response = msg.content;

    // Send the response back to the queue, as per the `replyTo` property.
    ch.sendToQueue(msg.properties.replyTo, response, {
        correlationId: msg.properties.correlationId
    });

    // Acknowledge the message.
    ch.ack(msg);

};

/**
 * A function that will be executed once we have a connection.
 * It will start an RPC server ready to respond to incoming RPC messages.
 * @return Void
 */
const start = () => {

    // Create a channel.
    mqClient.connection.createChannel()
    .then((ch) => {

        // This is kind of like the RPC name.
        const q = 'server_queue';

        // Create a queue.
        ch.assertQueue(q, { durable: false });
        // This will allow us to scale and start many of these if required.
        ch.prefetch(1);

        console.log('\nServer is awaiting RPC requests [server_queue]\n');

        // Wait and respond to incoming messages.
        ch.consume(q, reply(ch));

    });

}

// Announce errors.
mqClient.on('error', console.error);

// Wait until we have a connection.
mqClient.on('connect', start);

// Connect to MQ
mqClient.connect();
