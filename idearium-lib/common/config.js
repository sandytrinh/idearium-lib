var path = require('path'),
    Config = require('../lib/config');

module.exports = new Config(path.join(process.cwd(), 'config'));
