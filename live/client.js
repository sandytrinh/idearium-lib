/* eslint-disable no-console */

'use strict';

const uuid = require('uuid');
const mqClient = require('../idearium-lib/common/mq/client');

/**
 * A function that will be executed once we have a connection.
 * It will start an RPC server ready to respond to incoming RPC messages.
 * @return Void
 */
const start = () => {

    // Create a channel.
    mqClient.connection.createChannel()
    .then((ch) => {

        ch.assertQueue('', { exclusive: true })
            .then((q) => {

                const correlationId = uuid.v4();
                const data = {
                    'boolean': true,
                    'array': [],
                    'object': {},
                    correlationId
                };

                // Setup the consumer.
                ch.consume(q.queue, (msg) => {

                    if (msg.properties.correlationId === correlationId) {

                        console.log('\nGot a response...');
                        console.log('\nSent: ');
                        console.log(data);
                        console.log('\nGot:');
                        console.log(JSON.parse(msg.content.toString()));

                        process.exit(0);

                    }

                    setTimeout(() => {
                        mqClient.connection.close();
                        console.error('Timeout reached.');
                        process.exit(1);
                    }, 2000);

                }, {
                    noAck: true
                });

                // Send a queue to the server
                ch.sendToQueue('server_queue', new Buffer(JSON.stringify(data)), {
                    correlationId,
                    replyTo: q.queue
                });

                return q;

            });

    });

}

// Announce errors.
mqClient.on('error', console.error);

// Wait until we have a connection.
mqClient.on('connect', start);

// Connect to MQ
mqClient.connect();
