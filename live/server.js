/* eslint-disable no-console */

'use strict';

const config = require('../idearium-lib/common/config');
const RPC = require('../idearium-lib/common/mq/rpc');

/**
 * A function that given a channel, will return another function to process a message.
 * @param  {Object}   ch A RabbitMQ channel.
 * @return {Function}    A function that will process a message. Pass it to `ch.consume`.
 */
const reply = (msg, callback) => {

    console.log('Processing incoming message:');
    console.log(JSON.parse(msg.content.toString()));
    console.log('');

    // Determine the response for the message.
    // Simply echo back what we received.
    const response = msg.content;

    callback(response);

};

// eslint-disable-next-line no-unused-vars
const rpc = new RPC(config.get('mqUrl'), 'server', { name: 'server_queue', callback: reply });
