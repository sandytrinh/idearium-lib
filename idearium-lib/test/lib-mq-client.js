'use strict';

/* eslint-env node, mocha */

var expect = require('chai').expect,
    mq = require('..').mq,
    conf = require('./conf');

describe('class mq.Client', function () {

    describe('will throw an Error', function () {

        it('if url is not provided', function () {

            var fn = function () {
                // eslint-disable-next-line no-unused-vars
                var ideariumMq = new mq.Client();
            };

            expect(fn).to.throw(Error, /connectionString parameter is required/);

        });

    });

    describe('connects to', function () {

        it('RabbitMQ', function (done) {

            this.timeout(10000);

            // Catch and proxy errors to `done`.
            try {

                // Setup an instance of the class.
                var ideariumMq = new mq.Client(conf.rabbitUrl);

                // Add the connect listener. When this happens, we're done.
                ideariumMq.addListener('connect', function () {
                    return done();
                });

                // Listen for errors.
                ideariumMq.addListener('error', done);

                // This usually comes from common/mq/client, but we're not using that so we'll need to do them here.
                // Setup and start the connection straight away.
                ideariumMq.reconnectCount = 0;
                ideariumMq.connect();

            } catch (e) {
                return done(e);
            }

        });

    });

});
