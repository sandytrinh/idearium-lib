'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('../config'),
    mq = require('../../lib/mq'),
    debug = require('debug')('idearium-lib/common/mq/client');

/**
 * A common implement of mq.Client to be used across many clients.
 */
class Client extends mq.Client {

    constructor(url) {

        // Make sure we have a URL to connect to RabbitMQ.
        if (!url) {
            throw new Error('The RabbitMQ connection url must be provided.');
        }

        // Configure the MqClient class.
        super(url);

        // We'll customise the reconnection strategy from MqClient.
        this.reconnectCount = 0;

        // Try and load certificates
        let certsDir = path.join(process.cwd(), 'mq-certs'),
            caDir = path.join(certsDir, 'ca');

        fs.readdir(certsDir, (err, files) => {

            // That directory might not exist, that's okay.
            // Throw all other errors.
            if (err && err.code && err.code !== 'ENOENT') {
                throw err;
            }

            // If that directory didn't exist, `files` will be undefined.
            files = files || [];

            let certRegex = /\.cert$/,
                keyRegex = /\.key$/;

            // Do we have a cert and a key?
            // Loop through [certRegex, keyRegex] and ensure they can be matched in the files found in the directory.
            // If not, we're ready to connect.
            if (![certRegex, keyRegex].every((regex) => files.find((file) => regex.test(file)))) {
                return this.connect();
            }

            debug('Loading SSL cert and key');

            // Load in the certificate and the key
            this.options.cert = fs.readFileSync(path.join(certsDir, files.filter(file => certRegex.test(file) === true)[0]));
            this.options.key = fs.readFileSync(path.join(certsDir, files.filter(file => keyRegex.test(file) === true)[0]));

            // Do we have any ca certs?
            fs.readdir(caDir, (caErr, caFiles) => {

                // That directory might not exist, that's okay.
                // Throw all other errors.
                if (err && err.code && err.code !== 'ENOENT') {
                    throw err;
                }

                // If that directory didn't exist, `caFiles` will be undefined.
                this.options.ca = caFiles || [];

                if (this.options.ca.length) {
                    debug('Loading CA certs');
                }

                // Load each and every file.
                this.options.ca = this.options.ca.map(file => fs.readFileSync(path.join(caDir, file)));

                // Start the connection.
                this.connect();

            });

        });

    }

    //
    // Overwrite MqClient class methods.
    //

    // Log using debug.
    logError(err) {
        console.error(err.toString());
    }

    // Customise the reconnect timeout based on connection attempts.
    reconnect() {

        // set timeout to the power of 2
        var timeout = parseInt(Math.pow(2, this.reconnectCount++)) * 1000;
        super.reconnect(timeout);

    }

}

module.exports = new Client(config.get('mqUrl'));
