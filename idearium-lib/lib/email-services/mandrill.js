'use strict';

const mandrill = require('mandrill-api/mandrill');

/**
 * Send email request to Mandrill
 * @param  {String} apiKey Mandrill API key
 * @param  {Object}   message Mandrill API message object (see https://mandrillapp.com/api/docs/messages.JSON.html for other message properties)
 * @param  {Function} cb      Callback function
 */
function sendRequestToMandrill (apiKey, message, callback) {

    const mandrillClient = new mandrill.Mandrill(apiKey);

    // convert message.to string to an array
    if (!Array.isArray(message.to)) {
        message.to = message.to.split(',').map(function (email) {
            return {
                email: email
            };
        });
    }

    // convert message.fromEmail to message.from_email
    // eslint-disable-next-line camelcase
    message.from_email = message.fromEmail;
    delete message.fromEmail;

    mandrillClient.messages.send({
        'message': message,
        'async': true
    }, function (result) {
        return callback(null, result);
    }, callback);

}

class MandrillService {

    /**
     * Construct an instance of the MandrillService class.
     * @param  {String} apiKey Mandrill API key specific.
     * @return {Object}        MandrillService instance.
     */
    constructor (apiKey) {

        if (!apiKey) {
            throw new Error('apiKey parameter must be provided when creating a new Email instance.');
        }

        this.apiKey = apiKey;

        return this;

    }

    /**
     * Send an email using the Mandrill service.
     * @param  {Object}   message Message object
     * @param  {Function} cb      Callback function
     */
    send (message, callback) {

        return sendRequestToMandrill(this.apiKey, message, callback);

    }

}

module.exports = MandrillService;
