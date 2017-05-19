/* eslint-disable no-console */

'use strict';

const rpc = require('../idearium-lib/common/mq/rpc-client');

/**
 * Used to return a random number of ms, between 5000 and 15000.
 * @return {Number} Milliseconds.
 */
const timeoutValue = () => Math.floor(500 + Math.random()*500);

// Announce errors.
rpc.on('error', console.error);

// Wait until we have a queue.
rpc.on('queue', () => {

    // Used to continually publish messages and console.log responses for testing.
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

        rpc.publish('server_queue', data)
            .then((result) => {

                console.log('\nGot a response...');
                console.log(JSON.parse(result.content.toString()));
                console.log('\n--');

            })
            .catch((err) => console.error(err));

        // Do this again soon.
        setTimeout(publish, timeoutMs);

    }

    publish();

});
