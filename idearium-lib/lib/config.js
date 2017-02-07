'use strict';

var path = require('path'),
    nconf = require('nconf');

class Config {

    /**
     * Constructor
     * @param  {String} dir      Config directory
     * @return {Object}             Config instance
     */
    constructor(dir) {

        if (!dir) {
            throw new Error('dir parameter must be provided when creating a new Config instance.');
        }

        this.config = new nconf.Provider();
        this.config.use('memory');

        // load in the config file
        this.config.defaults(require(path.resolve(dir, 'config.js')));

        // add hooks for environment flag
        if (process.env.NODE_ENV) {
            this.config.set(process.env.NODE_ENV, true);
        }

        // Setup the environment.
        this.config.set('env', process.env.NODE_ENV);

        // always prefer ENV variables, over those loaded above
        this.config.env();

    }

    /**
     * Set config keyed value
     * @param  {String} key   Key name
     * @param  {String} value Value
     */
    set(key, value) {
        this.config.set(key, value);
    }

    /**
     * Get config keyed value
     * @param  {String} key   Key name
     * @return {String}     value
     */
    get(key) {
        return this.config.get(key);
    }

    /**
     * Get a list of all the config values
     * @return {Object}     key value object
     */
    getAll() {

        var keys = [],
            result = {},
            _config = this.config;

        Object.keys(_config.stores).forEach(function (storeType) {
            keys = keys.concat(Object.keys(_config.stores[storeType].store).filter(function (key) {
                return keys.indexOf(key) < 0;
            }));
        });

        // that we have all of the keys, loop through and get their values
        keys.sort().forEach(function (key) {
            result[key] = _config.get(key);
        });

        return result;

    }

}

module.exports = Config;
