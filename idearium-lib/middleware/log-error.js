'use strict';

var bunyan = require('bunyan');

module.exports = function (err, req, res, next) {

    // Load the configuration, and an instance of Logger.
    const config = require('../common/config'),
        Logger = require('../').logs.Logger;

    // Create an instance of the logger.
    const log = new Logger({
        name: 'error',
        context: 'idearium-lib:middleware:log-error',
        level: 'error',
        stdErr: config.get('logToStdout') == undefined ? false : config.get('logToStdout'),
        token: config.get('logEntriesToken') || '',
        remote: (config.get('logLocation') || '').toLowerCase() === 'remote',
        local: (config.get('logLocation') || '').toLowerCase() === 'local',
        serializers: {
            req: bunyan.stdSerializers.req,
            res: bunyan.stdSerializers.res,
            err: bunyan.stdSerializers.err
        }
    });

    // The duration of the request.
    const duration = Date.now() - (req.responseStart || Date.now());

    // The packet we're going to log.
    const packet = {
        req: req,
        err: err,
        production: config.get('production'),
        status: res.statusCode,
        responseTime: duration
    };

    // A short version of the user, if it exists.
    if (req.user && req.user.username && req.user._id) {
        packet.user = {
            username: req.user.username,
            id: req.user._id
        };
    }

    // Log the error.
    log.error(packet);

    // Next middleware.
    return next(err);

};
