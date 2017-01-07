/* eslint-env node, mocha */

'use strict';

describe('common/mq/client', function () {

    // This is run after common-config and will have therefore cached the config from the previous test.
    // Set the mqUrl value as common/mq/client uses it.
    before(function(done) {

        require('../common/config').set('mqUrl', 'amqp://lib:lib@localhost:5672');
        return done();

    });

    it('will connect to rabbit mq', function (done) {

        this.timeout(10000);

        // Catch and proxy any errors to `done`.
        try {

            // Create an instance of `mq.Client`.
            var mqClient = require('../common/mq/client');

            // When the `connect` event is fired, we're done.
            mqClient.addListener('connect', function () {
                return done();
            });

            // Listen for errors and send to `done`.
            mqClient.addListener('error', done);

        } catch (e) {
            return done(e);
        }

    });

});
