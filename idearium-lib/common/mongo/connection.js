'use strict';

// We require a slightly different setup here, to allow an SSL connection to MongoDB.

const mongoose = require('mongoose');
const config = require('../config');
const certs = require('./certs');
const debug = require('debug')('idearium-lib:common:mongo/connection');

// Use native promises for database queries.
mongoose.Promise = global.Promise;

/**
 * Create mongoose connections.
 * @param {Array} connections Mongo connections.
 * @param {String} [connections.uri=config.get('dbUrl')] Mongo connections.
 * @param {Object} connections.options Mongo connections.
 * @return {Promise} Returns an array of connections.
 */
const connect = (connections = [{ uri: config.get('dbUrl') }]) => new Promise((resolve, reject) => {

    certs
      .then(loadedCerts => Promise.all(connections.map(({ uri, options }) => {

          const defaults = { useMongoClient: true };

          if (loadedCerts.length) {

              defaults.mongos = {
                  ssl: true,
                  sslCA: loadedCerts,
                  sslValidate: true,
              };

          }

          debug(`Connecting to database: ${uri} ${loadedCerts.length > 0 ? 'with' : 'without'} SSL`);

          return mongoose.createConnection(uri, Object.assign({}, defaults, options));

      })))
      .then(resolve)
      .catch(reject);

});

module.exports = connect;
