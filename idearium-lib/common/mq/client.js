'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    config = require('../config'),
    mq = require('../../lib/mq'),
    debug = require('debug')('idearium-lib:common/mq/client');

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

        // A potential certificates directory, specific to environment.
        // It may not exist.
        const certsDir = path.join(process.cwd(), 'mq-certs', config.get('env'));

        async.waterfall([

            // Attempt to load the certificates directory.
            (cb) => {

                // Attempt to read the directory.
                fs.readdir(certsDir, (certsErr, certsFiles) => {

                    if (certsErr) {
                        return cb(certsErr);
                    }

                    certsFiles = certsFiles || [];

                    const certRegex = /\.cert$/;
                    const keyRegex = /\.key$/;
                    const certAndKeyExists = [certRegex, keyRegex].every((regex) => {
                        return certsFiles.findIndex(file => regex.test(file)) >= 0;
                    });

                    // Do we have a cert and a key?
                    if (certAndKeyExists) {

                        debug('Loading SSL cert and key');

                        // Load in the cert and the key.
                        this.options.cert = fs.readFileSync(path.join(certsDir, certsFiles.filter(file => certRegex.test(file) === true)[0]));
                        this.options.key = fs.readFileSync(path.join(certsDir, certsFiles.filter(file => keyRegex.test(file) === true)[0]));

                    }

                    return cb(null);

                });

            },

            // Attempt to load CA certs.
            (cb) => {

                // The certificate authority directory.
                const caDir = path.join(certsDir, 'ca');

                // Do we have any ca certs?
                fs.readdir(caDir, (caErr, caFiles) => {

                    if (caErr) {
                        return cb(caErr);
                    }

                    // If that directory didn't exist, `caFiles` will be undefined.
                    this.options.ca = caFiles || [];

                    if (this.options.ca.length) {
                        debug(`Loading CA certs from ${caDir}`);
                    }

                    // Load each and every file.
                    this.options.ca = this.options.ca.map(file => fs.readFileSync(path.join(caDir, file)));

                    cb(null);

                });

            }

        ], (err) => {

            // If we have anything other than an ENOENT error, throw it.
            if (err && err.code && err.code !== 'ENOENT') {
                throw err;
            }

            // Connect even if there was an ENOENT error.
            this.connect();

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
