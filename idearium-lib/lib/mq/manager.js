'use strict';

var path = require('path'),
    EventEmitter = require('events').EventEmitter,
    Loader = require('../loader');

class Manager extends EventEmitter {

    constructor(path) {

        if (!path) {
            throw new Error('The path parameter is required');
        }

        // Instantiate super class.
        super();

        // We'll store the loaded messages here.
        this.messages = {};

        // Let's attempt to the messages in straight away.
        this.loader.load(path).then((messages) => {

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

        Object.keys(messages).forEach(function (messageName) {

            if (!messages[messageName].consume) {
                return;
            }

            messages[messageName].consume();

        });

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
