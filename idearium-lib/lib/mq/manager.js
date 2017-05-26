'use strict';

var EventEmitter = require('events').EventEmitter,
    Loader = require('../loader');

/**
 * A class to support and load RabbitMQ consumers and producers.
 * @constructor
 * @extends EventEmitter
 * @param {String} param The path to load consumers and producers from.
 */
class Manager extends EventEmitter {

    constructor(path) {

        if (!path) {
            throw new Error('The path parameter is required');
        }

        // Instantiate super class.
        super();

        // We'll store the loaded messages here.
        this.messages = {};

        // We'll store the path for later on
        this.path = path;

        // Load in the messages straight away.
        this.load();

    }

    /**
     * Initiate loading the files from the directory.
     * @return {Promise} A promise that will resolve once loaded.
     */
    load () {

        // Let's attempt to the messages in straight away.
        return this.loader.load(this.path).then((messages) => {

            // Add the messages to our class instance.
            this.messages = messages;

            // Emit an event so implementing code can proceed.
            this.emit('load');

        });

    }

    /**
     * Return an instance of the Loader class, configured as required.
     * @return {Loader} An instance of the Loader class.
     */
    get loader () {

        if (!this._loader) {
            this._loader = new Loader();
            this._loader.camelCase = false;
        }

        return this._loader;

    }

    /**
     * Register message queue consumers
     * @return {[type]} [description]
     */
    registerConsumers() {

        var messages = this.messages;

        return Promise.all(Object.keys(messages)
            .filter(messageName => messages[messageName].consume !== undefined)
            .map(messageName => messages[messageName].consume()));

    }

    /**
     * Publish a message
     * @param  {String} messageName Message name (should match the name of the message file)
     * @return {[type]}             [description]
     */
    publish(messageName) {

        if (!this.messages[messageName]) {
            throw new Error(`"${messageName}" message is not defined.`);
        }

        if (!this.messages[messageName].publish) {
            return;
        }

        // Remove first argument and publish.
        this.messages[messageName].publish.apply(this, [].slice.call(arguments).slice(1));

    }

}

module.exports = Manager;
