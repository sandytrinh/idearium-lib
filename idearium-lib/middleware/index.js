'use strict';

const Loader = require('../lib/loader'),
    loader = new Loader();

loader.sync = true;

// load modules
module.exports = loader.load(__dirname);
