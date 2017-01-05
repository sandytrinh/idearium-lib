'use strict';

var le = require('le_node');

class LogEntries {

    constructor (_name, _level, _context, _token) {

        // Create an instance of LogEntries, Bunyan style.
        let {level, name, stream} = le.bunyanStream({ token: _token });

        // Store parameters locally, and update LogEntries with the correct values.
        this.name = name = _name;
        this.level = level = _level;
        this.context = _context;
        this.stream = stream;

    }

    /**
     * Take an object and log it (Bunyan streams).
     * @param  {object} rec An object with information to log.
     * @return {void}
     */
    write () {
        this.stream.apply(this.stream, arguments);
    }

    /**
     * Produce an object suitable to describe a Bunyan stream.
     * @return {object} An object that Bunyan can pass a stream.
     */
    forBunyan () {

        return {
            name: this.name,
            level: this.level,
            stream: this.stream
        }

    }

}

module.exports = LogEntries;
