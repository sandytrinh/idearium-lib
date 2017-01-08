'use strict';

var bunyan = require('bunyan');

module.exports = function (err) {

    // Load the configuration, and an instance of Logger.
    const config = require('../common/config'),
        Logger = require('../').logs.Logger;

    // Create an instance of the logger.
    const log = new Logger({
        name: 'exception',
        context: 'idearium-lib:common:exception',
        level: 'fatal',
        stdErr: true,
        token: config.get('logEntriesToken') || '',
        remote: (config.get('logLocation') || '').toLowerCase() === 'remote',
        local: (config.get('logLocation') || '').toLowerCase() === 'local',
        serializers: {
            req: bunyan.stdSerializers.req,
            res: bunyan.stdSerializers.res,
            err: bunyan.stdSerializers.err
        }
    });

    // The packet we're going to log.
    const packet = {
        err: err,
        production: config.get('production'),
        status: 500
    };

    log.fatal(packet);

    // quit this process in two seconds
    // enough time to fire off the error to logentries
    setTimeout(() => process.exit(1), 2000);

};
