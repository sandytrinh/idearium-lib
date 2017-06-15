'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    config = require('../config'),
    debug = require('debug')('idearium-lib:common/mq/client');

/**
 * Load the certificates for RabbitMQ, if they exist.
 * They should be put into an `mq-certs/{env}` directory with a cert, key and any CA certificates in a directory.
 * @return [type] [description]
 */
const certs = () => {

    return new Promise((resolve, reject) => {

        // A potential certificates directory, specific to environment.
        // It may not exist.
        const certsDir = path.join(process.cwd(), 'mq-certs', config.get('env'));
        const options = {};

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

                        debug(`Loading SSL cert and key from ${certsDir}`);

                        // Load in the cert and the key.
                        options.cert = fs.readFileSync(path.join(certsDir, certsFiles.filter(file => certRegex.test(file) === true)[0]));
                        options.key = fs.readFileSync(path.join(certsDir, certsFiles.filter(file => keyRegex.test(file) === true)[0]));

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
                    options.ca = caFiles || [];

                    if (options.ca.length) {
                        debug(`Loading CA certs from ${caDir}`);
                    }

                    // Load each and every file.
                    options.ca = options.ca.map(file => fs.readFileSync(path.join(caDir, file)));

                    cb(null);

                });

            }

        ], (err) => {

            // If we have anything other than an ENOENT error, throw it.
            if (err && err.code && err.code !== 'ENOENT') {
                reject(err);
            }

            // Resolve the promise with the loaded information.
            resolve(options);

        });

    });

}

module.exports = certs();
