'use strict';

var bunyan = require('bunyan'),
    path = require('path'),
    pkgStreams = require('./streams');

//
// Static constants.
//
const LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

//
// Private methods (pure functions)
//

/**
 * Create an instance of a Bunyan child logger.
 * @param  {String} name        The name of the logger (also the filename).
 * @param  {String} context     The context to provide with the child logger.
 * @param  {Array} serializers  Serializers that the logger should use, could be multiple.
 * @param  {Array} streams      Streams that the logger should use, could be multiple.
 * @return {Bunyan.logger}      Returns the Bunyan logger.
 */
function createLogger (name, context, serializers, streams) {
    return bunyan.createLogger({name, serializers, streams}).child({context});
}

/**
 * Setup a proxy method on the Logger class to log against Bunyan at a specific level.
 * @param  {String} level The name of the level and method to generate.
 * @return {void}
 */
function logProxyDecorator (level) {

    this[level] = (...args) => {
        this.log[level].apply(this.log, args);
    }

}

/**
 * Retrieve the streams for this Logger.
 * @return {Array} An array of streams, as per Bunyan.
 */
function getStreams (_streams) {

    _streams = _streams || [];

    // Create the streams if they don't already exist.
    if (!this._streams) {

        this._streams = [];

        // Are we going to log locally to file?
        if (this.local) {
            this._streams.push(this.localStream());
        }

        // Are we going to log to stdErr?
        if (this.stdErr) {
            this._streams.push(this.stdErrStream());
        }

        // Are we going to log remotely?
        if (this.remote) {
            this._streams.push(this.remoteStream());
        }

    }

    // Add the user provider streams and return.
    return this._streams.concat(_streams);

}

//
// Class
//
class Logger {

    constructor (opts) {

        opts = opts || {};

        // Check required arguments.
        if (!opts.name) {
            throw new Error('You must provide the name option');
        }

        if (!opts.context) {
            throw new Error('You must provide the context option');
        }

        // Required arguments.
        this.name = opts.name;
        this.context = opts.context;

        // Optional arguments.
        this.level = opts.level || 'warn';
        this.remote = typeof opts.remote === 'undefined' ? false : opts.remote;
        this.token = opts.token || undefined;
        this.local = typeof opts.local === 'undefined' ? true : opts.local;
        this.stdErr = typeof opts.stdErr === 'undefined' ? false : opts.stdErr;
        this.dir = opts.dir || path.join(path.resolve(process.cwd()), 'logs');
        this.streams = getStreams.apply(this, opts.streams);

        // Check assumptions.
        if (LEVELS.indexOf(this.level) < 0) {
            throw new Error('level must be one of these values "trace", "debug", "info", "warn", "error", "fatal"');
        }

        if (this.remote && !this.token) {
            throw new Error('You\'ve requested remote logging, as such you must provide the token option');
        }

        // Setup the serializers
        this.serializers = opts.serializers || bunyan.stdSerializers;

        // Setup log at level proxy functions (i.e. logger.info()).
        LEVELS.forEach((level) => {
            logProxyDecorator.call(this, level);
        });

        // Instantiate bunyan.
        this.log = createLogger(this.name, this.context, this.serializers, this.streams);

    }

    //
    // Getter/setters methods
    //

    /**
     * Retrieve the levels for the Logger.
     * @return {Array} An array of levels.
     */
    get levels () {
        return LEVELS;
    }

    //
    // Public methods
    //

    /**
     * Retrieve a local stream (file).
     * @return {Object} A file stream object for Bunyan.
     */
    localStream () {

        return {
            name: this.name,
            level: this.level,
            path: path.join(this.dir, `${this.name}.log`)
        };

    }

    /**
     * Retrieve a stderr stream.
     * @return {object} A stderr stream for Bunyan.
     */
    stdErrStream () {
        return new pkgStreams.StdErr(this.name, this.level, this.context).forBunyan();
    }

    /**
     * Retrieve a remote stream.
     * @return {object} A remote stream for Bunyan.
     */
    remoteStream () {
        return new pkgStreams.LogEntries(this.name, this.level, this.context, this.token).forBunyan();
    }

}

module.exports = Logger;
