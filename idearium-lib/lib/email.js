'use strict';

const validator = require('validator');

class Email {

    /**
     * Constructor
     * @param  {String} apiKey API key specific to the service.
     * @return {Object}        Email instance.
     */
    constructor(apiKey, Service) {

        if (!apiKey) {
            throw new Error('apiKey parameter must be provided when creating a new Email instance.');
        }

        if (!Service) {
            throw new Error('service parameter must be provided when creating a new Email instance.');
        }

        this.apiKey = apiKey;
        this.service = new (Service)(this.apiKey);

    }

    /**
     * Validation message object
     * @param  {Object}   message Message object
     */
    static validateMessage (message) {

        if (!(message.html || message.text)) {
            throw new Error('"message.html" and "message.text" is missing, one of these fields is required.');
        }

        if (!message.fromEmail) {
            throw new Error('"message.fromEmail" field is either missing or is empty.');
        }

        if (!message.to) {
            throw new Error('"message.to" field is either missing or is empty.');
        }

        if (typeof message.to !== 'string' && !Array.isArray(message.to)) {
            throw new Error('"message.to" must be of type String or Array.');
        }

        if (typeof message.to === 'string') {

            if (!validator.isEmail(message.to)) {
                throw new Error(message.to + ' is not a valid email address.');
            }

        } else {

            // message.to must be an array
            if (message.to.length === 0) {

                throw new Error('"message.to" Array field is empty.');

            } else {

                for (var i = 0; i < message.to.length; i++){

                    if (!message.to[i].email) {
                        throw new Error('Missing "email" field in one of the "message.to" Array.');
                    }

                    if (!validator.isEmail(message.to[i].email)) {
                        throw new Error(message.to[i].email + ' is not a valid email address.');
                    }

                }

            }

        }

        if (!message.subject) {
            throw new Error('"message.subject" field is either missing or is empty.');
        }

    }

    /**
     * Send email via service
     * @param  {Object}   message Message object
     * @param  {Function} cb      Callback function
     */
    send (message, cb) {

        // Check we have everything we need to send an email
        Email.validateMessage(message);

        // Send a request to send an email
        this.service.send(message, cb);

    }

}

module.exports = Email;
