'use strict';

const config = require('./config');
const lib = require('../');
const log = require('./log')('idearium-lib:common/mandrill-email');

class MandrillEmail extends lib.Email {

    constructor () {

        if (!config.get('mandrillAPIKey')) {
            throw new Error('"mandrillAPIKey" config is not defined.');
        }

        super(config.get('mandrillAPIKey'), lib.emailServices.Mandrill);

    }

    send (message, cb) {

        // Set default fromEmail.
        message.fromEmail = message.fromEmail || config.get('fromEmail');

        // Execute `send` on the super class.
        super.send(message, (err, result) => {

            log.info('Sent %d emails for %s via Mandrill.', message.to.length, message.subject);

            // Remove html content as we don't need it in the log.
            delete message.html;

            if (err) {

                log.error({ err, message }, 'Error sending email via Mandrill');

                return cb(err);

            }

            const errors = [];

            result.forEach((obj) => {

                if (obj.status === 'rejected' || obj.status === 'invalid') {
                    errors.push(obj);
                }

            });

            if (errors.length) {

                log.error({ err: errors, message }, 'Some of the emails failed to send via Mandrill');

            }

            return cb(null, result);

        });

    }

}

module.exports = MandrillEmail;
