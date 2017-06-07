'use strict';

const bunyan = require('bunyan');
const config = require('../common/config');
const { Logger } = require('../').logs;

const logEntriesToken = config.get('logEntriesToken');
const logLevel = config.get('logLevel');
const logLocation = config.get('logLocation');
const logToStdout = config.get('logToStdout');

/**
 * Create a new Logger instance.
 * @param {String} context Context of the logs.
 * @param {String} [name='application'] Application name.
 * @return {Object} Creates a new Logger instance.
 */
const log = (context, name = 'application') => {

    if (!context) {
        throw new Error('You must supply the context parameter');
    }

    return new Logger({
        context,
        level: logLevel,
        local: logLocation.toLowerCase() === 'local',
        name,
        remote: logLocation.toLowerCase() === 'remote',
        serializers: {
            err: bunyan.stdSerializers.err,
            req: bunyan.stdSerializers.req,
            res: bunyan.stdSerializers.res,
        },
        stdErr: logToStdout,
        token: logEntriesToken,
    });

};

module.exports = log;
