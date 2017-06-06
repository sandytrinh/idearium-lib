'use strict';

const find = require('./find');
const has = require('./has');
const is = require('./is');
const to = require('./to');
// Destructure to remove deprecated and conflicting apis.
const { debuglog, deprecate, format, inherits, inspect } = require('util');

// Merge all the functions and the node built in util library.
const utilLib = Object.assign(
    {},
    { debuglog, deprecate, format, inherits, inspect },
    find,
    has,
    is,
    to
);

module.exports = utilLib;
