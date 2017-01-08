'use strict';

var bunyan = require('bunyan');

module.exports = function (req, res, next) {

    // Load the configuration, and an instance of Logger.
    const config = require('../common/config'),
        Logger = require('../').logs.Logger,
        exclude = config.get('logRequestExclude') || ['admin\/public', 'ping'],
        regex = new RegExp('^\/' + exclude.join('|') + '\/?.*$'),
        start = Date.now();

    // Don't do any of this, if the regex matches.
    if (regex.test(req.url)) {
        return next();
    }

    // Let's move on straight away
    next();

    // Create an instance of the logger.
    const log = new Logger({
        name: 'request',
        context: 'idearium-lib:middleware:log-request',
        level: 'info',
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

    // Set the response start.
    req.responseStart = req.responseStart || start;

    // When the request is finished, log it.
    res.on('finish', function () {

        let duration = Date.now() - start,
            packet = {
                req: req,
                production: config.get('production'),
                status: this.statusCode,
                responseTime: duration
            };

        // Log a short version of the user object, if it exists.
        if (req.user && req.user.username && req.user._id) {
            packet.user = {
                username: req.user.username,
                id: req.user._id
            };
        }

        // Log the data
        log.info(packet);

    });

};
