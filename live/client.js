/* eslint-disable no-console */

'use strict';

const uuid = require('uuid');
const mqClient = require('../idearium-lib/common/mq/client');

const promises = {};

/**
 * Used to return a random number of ms, between 5000 and 15000.
 * @return {Number} Milliseconds.
 */
const timeoutValue = () => Math.floor(500 + Math.random()*500);

// This function will map correlationIds to promises;
const rpcManager = (channel, consumerQueue, publishQueue, correlationId, data, resolve, reject) => {

    // Allow 2000 milliseconds for the RPC to work.
    const timeoutId = setTimeout(() => {
        reject(new Error('RPC timed out.'))
    }, 2000);

    promises[correlationId] = { resolve, reject, timeoutId };

    // Send a message to the server
    channel.sendToQueue(publishQueue, new Buffer(JSON.stringify(data)), {
        correlationId,
        replyTo: consumerQueue.queue
    });

}

const rpcPublish = (connection, channel, consumerQueue, publishQueue, data) => new Promise((resolve, reject) => rpcManager(channel, consumerQueue, publishQueue, uuid.v4(), data, resolve, reject))

const rpcConsume = (channel, consumerQueue) => {

    // Consume the response.
    channel.consume(consumerQueue.queue, (msg) => {

        const correlation = promises[msg.properties.correlationId];

        if (!correlation) {
            console.log('No correlationId found.');
            return;
        }

        // Clear the timeout.
        clearTimeout(correlation.timeoutId);

        // Delete the correlation because we've resolve it.
        delete promises[msg.properties.correlationId];

        // Resolve the promise
        correlation.resolve(msg);

    }, {
        noAck: true
    });

};

/**
 * A function that will be executed once we have a connection.
 * It will start an RPC server ready to respond to incoming RPC messages.
 * @return Void
 */
const setup = () => {

    return new Promise((resolve, reject) => {

        let channel;
        let consumerQueue;

        mqClient.connection.createChannel()
            .then((ch) => {

                channel = ch;
                return ch.assertQueue('', { exclusive: true });

            })
            .then((q) => {

                consumerQueue = q;

                resolve({
                    channel,
                    consumerQueue
                });

                rpcConsume(channel, consumerQueue);

            })
            .catch(reject);

    });

}

// Announce errors.
mqClient.on('error', console.error);

// Wait until we have a connection.
mqClient.on('connect', () => {

    let connection = mqClient.connection;
    let channel;
    let consumerQueue;

    const publish = () => {

        const timeoutMs = timeoutValue();
        const data = {
            'boolean': true,
            'array': [],
            'object': {},
            'random': Math.floor(Math.random() * 40000)
        };

        console.log(`\nPublishing... repeating in ${timeoutMs/1000}s...`);

        console.log('\nSent: ');
        console.log(data);

        rpcPublish(connection, channel, consumerQueue, 'server_queue', data)
        .then((result) => {

            console.log('\nGot a response...');
            console.log(JSON.parse(result.content.toString()));
            console.log('\n--');

        })
        .catch((err) => console.error(err));

        // Do this again soon.
        setTimeout(publish, timeoutMs);

    }

    // Setup the persistant channel and queue.
    setup()
        .then((r) => {

            channel = r.channel;
            consumerQueue = r.consumerQueue;

            publish();

        })
        .catch(console.error);

});

// Connect to MQ
mqClient.connect();
