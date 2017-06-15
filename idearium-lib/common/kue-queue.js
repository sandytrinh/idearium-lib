'use strict';

const config = require('./config');
const kue = require('kue');

if (!config.get('kuePrefix')) {
    throw new Error('You must define a configuration called \'kuePrefix\' to determine which KUE queue should be used.');
}

module.exports = kue.createQueue({
    prefix: config.get('kuePrefix'),
    redis: config.get('cacheUrl'),
});
