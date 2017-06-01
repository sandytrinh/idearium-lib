/* eslint-env node, mocha */

'use strict';

let path = require('path'),
    expect = require('chai').expect,
    copy = require('copy-dir'),
    rimraf = require('rimraf'),
    dir = path.resolve(__dirname),
    conf = require('./conf');

describe('common/mq/client', function () {

    // This is run after common-config and will have therefore cached the config from the previous test.
    // Set the mqUrl value as common/mq/client uses it.
    before(function(done) {

        require('../common/config').set('mqUrl', conf.rabbitUrl);

        // Move the test files into place
        copy(path.resolve(dir, 'data', 'mq-certs'), path.join(dir, '..', 'mq-certs', process.env.NODE_ENV), done);

    });

    it('will connect to rabbit mq', function (done) {

        this.timeout(10000);

        // Catch and proxy any errors to `done`.
        try {

            // Create an instance of `mq.Client`.
            var mqClient = require('../common/mq/client');

            // When the `connect` event is fired, we're done.
            // Only listen once, because `../common/mq/client` is used in later tests.
            // It will be cached, and so we don't want to execute this instance of `done` again.
            mqClient.once('connect', function () {

                // Ensure it successfully loaded all certs.
                expect(mqClient.options).to.have.property('key');
                expect(mqClient.options).to.have.property('cert');
                expect(mqClient.options).to.have.property('ca');
                expect(mqClient.options).to.have.property('servername');
                expect(mqClient.options.ca).to.be.a('array');

                return done();

            });

            // Listen for errors and send to `done`.
            mqClient.once('error', done);

        } catch (e) {
            return done(e);
        }

    });

    after(function (done) {

        rimraf(path.join(dir, '..', 'mq-certs'), done);

    });

});
