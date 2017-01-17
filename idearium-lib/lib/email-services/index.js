'use strict';

var Loader = require('../loader'),
    loader;

// Create an instance of Loader, and configure it with ClassCase.
loader = new Loader();
loader.classCase = true;
loader.sync = true;

module.exports = loader.load(__dirname);
