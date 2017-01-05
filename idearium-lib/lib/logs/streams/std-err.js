'use strict';

/**
 * A class to be used as a Bunyan stream. It will take the information and log via `debug`.
 */
class StdErr {

    constructor (name, level, context) {

        // Store the parameters.
        this.name = name;
        this.level = level;
        this.context = context;

        // Generate an instance of `debug` that will actually do the logging.
        this.log = require('debug')(this.context);

        // Return `this` for method chaining.
        return this;

    }

    /**
     * Take an object and log it (Bunyan streams).
     * @param  {object} rec An object with information to log.
     * @return {void}
     */
    write (rec) {
        this.log(rec);
    }

    /**
     * Produce an object suitable to describe a Bunyan stream.
     * @return {object} An object that Bunyan can pass a stream.
     */
    forBunyan () {

        return {
            name: this.name,
            level: this.level,
            stream: this
        }

    }

}

module.exports = StdErr;
