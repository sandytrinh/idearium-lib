'use strict';

// We require a slightly different setup here, to allow an SSL connection to MongoDB.

const mongoose = require('mongoose');
const config = require('../config');
const certs = require('./certs');
const debug = require('debug')('idearium-lib:common:mongo/connection');

// Options will go here.
const opts = {};

// Turn on Promise support.
mongoose.Promise = global.Promise;

// Once the certs have loaded, we'll update the options and connect.
certs.
    then(loadedCerts => {

        if (loadedCerts.length) {

            opts.mongos = {
                ssl: true,
                sslCA: loadedCerts,
                sslValidate: true,
            };

        }

        debug(`Connecting to database ${Object.keys(opts).length > 0 ? 'with' : 'without'} SSL.`);

        // Connect to Mongo on Compose.io using the certificates loaded.
        mongoose.connect(config.get('dbUrl'), opts);

    });


// Export mongoose
module.exports = mongoose;
