'use strict';

const config = require('./config');
const kue = require('kue');

module.exports = kue.createQueue({
    prefix: config.get('kuePrefix'),
    redis: config.get('cacheUrl'),
});
