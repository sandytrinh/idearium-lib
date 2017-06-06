'use strict';

// We require a slightly different setup here, to allow an SSL connection to MongoDB.

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config');
const log = require('./log')('rasnet:app:lib/mongodb');

// This will be changed upon certain conditions (below).
let opts = {};

// Turn on Promise support.
mongoose.Promise = global.Promise;

// When we're not connecting to Compose.io, we don't use an SSL connection.
if (config.get('dbSSL')) {

    log.debug('Connecting to database via SSL.');

    // Load in our certificates.
    // The following is blocking so works synchronously.
    // eslint-disable-next-line no-sync
    const ca = [fs.readFileSync(path.resolve(__dirname, '..', 'mongo-certs', 'compose.io.cert'))];

    opts = {
        mongos: {
            ssl: true,
            sslCA: ca,
            sslValidate: true,
        },
    };

}

// Connect to Mongo on Compose.io using the certificates loaded.
mongoose.connect(config.get('dbUrl'), opts);

// Export mongoose
module.exports = mongoose;
