'use strict';

// We require a slightly different setup here, to allow an SSL connection to MongoDB.

const fs = require('fs');
const path = require('path');
const config = require('../config');
const debug = require('debug')('idearium-lib:common:mongo/certs');

/**
 * Load the CA certificates for MongoDB, if they exist.
 * They should be put into the `mongo-certs/{env}/ca` directory.
 * @return {Promise} A promise that will be resolved with the certificates
 */
const certs = () => {

    return new Promise((resolve, reject) => {

        // A potential certificates directory, specific to environment.
        // It may not exist.
        const certsDir = path.join(process.cwd(), 'mongo-certs', config.get('env'));
        // The certificate authority directory.
        const caDir = path.join(certsDir, 'ca');
        // Loaded certs will go here.
        let certs = [];

        // Do we have any ca certs?
        fs.readdir(caDir, (caErr, caFiles) => {

            // If we have anything other than an ENOENT error, reject the Promise.
            if (caErr && caErr.code && caErr.code !== 'ENOENT') {
                reject(caErr);
            }

            // If that directory didn't exist, `caFiles` will be undefined.
            certs = caFiles || [];

            debug(`Loading ${certs.length} CA certs from ${caDir}`);

            // Load each and every file.
            certs = certs.map(file => fs.readFileSync(path.join(caDir, file)));

            // We're finished.
            resolve(certs);

        });

    });

}

// Export the promise.
module.exports = certs();
