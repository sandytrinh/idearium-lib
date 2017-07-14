'use strict';

const debug = require('debug')('idearium-lib:common:mongo/connection');
const mongoose = require('mongoose');

// Use native promises for database queries.
mongoose.Promise = global.Promise;

/**
 * Create mongoose connections.
 * @example
 * // returns [db]
 * connect([
     {
         options: {
             ssl: true,
             sslValidate: true,
         },
         uri: mongodb://localhost:27017/admin,
     },
 ])
 * @param {Array} connections Mongo connections.
 * @param {Object} [connections.options] Mongo connections.
 * @param {String} [connections.uri] Mongo connections.
 * @param {Object} connections.options Mongo connections.
 * @return {Promise} Returns an array of connections.
 */
const connect = (connections) => new Promise((resolve, reject) => {

    require('./certs')
      .then(loadedCerts => Promise.all(connections.map(({ options, uri }) => {

          const defaults = { useMongoClient: true };

          if (loadedCerts.length) {
              defaults.sslCA = loadedCerts;
          }

          debug(`Connecting to database: ${uri} ${loadedCerts.length > 0 ? 'with' : 'without'} SSL`);

          return mongoose.connect(uri, Object.assign({}, defaults, options));

      })))
      .then(resolve)
      .catch(reject);

});

module.exports = connect;
