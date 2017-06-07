'use strict';

const debug = require('debug')('idearium-lib:common:exception');
const exitErrCode = 1;

module.exports = function (err) {

    debug('Exception logged. Quitting Node.js process.');

    // Log the error to console.
    // eslint-disable-next-line no-console
    console.error(err);

    // Quit the process entirely.
    process.exit(exitErrCode);

};
