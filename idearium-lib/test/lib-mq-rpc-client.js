'use strict';

/* eslint-env node, mocha */

var expect = require('chai').expect,
    mq = require('..').mq,
    conf = require('./conf');

describe('class mq.RpcClient', function () {

    describe('will throw an Error', function () {

        it('if url is not provided', function () {

            var fn = function () {
                // eslint-disable-next-line no-unused-vars
                var ideariumMq = new mq.RpcClient();
            };

            expect(fn).to.throw(Error, /connectionString parameter is required/);

        });

    });

    describe('connects to', function () {

        it('RabbitMQ and gracefully disconnects', function (done) {

            this.timeout(10000);

            // Catch and proxy errors to `done`.
            try {

                // Setup an instance of the class.
                var ideariumRPC = new mq.RpcClient(conf.rabbitUrl);

                // Add the connect listener. When this happens, we're done.
                ideariumRPC.addListener('queue', () => {

                    ideariumRPC.disconnect()
                        .then(() => done())
                        .catch(done);

                });

                // Listen for errors.
                ideariumRPC.addListener('error', done);

                // This usually comes from common/mq/client, but we're not using that so we'll need to do them here.
                // Setup and start the connection straight away.
                ideariumRPC.reconnectCount = 0;
                ideariumRPC.connect();

            } catch (e) {
                return done(e);
            }

        });

    });

    describe('RPC calls', function () {

        it('will timeout', function (done) {

            this.timeout(10000);

            // Catch and proxy errors to `done`.
            try {

                // Setup an instance of the class.
                var ideariumRPC = new mq.RpcClient(conf.rabbitUrl);

                // Add the connect listener. When this happens, we're done.
                ideariumRPC.addListener('queue', () => {

                    ideariumRPC.publish('missing-rpc', {})
                        .then(() => done(new Error('Should not have resolved.')))
                        .catch((err) => {

                            expect(err).to.be.an.instanceof(Error);
                            expect(err.message).to.match(/RPC timed out/);

                            return done();

                        });

                });

                // Listen for errors.
                ideariumRPC.addListener('error', done);

                // This usually comes from common/mq/client, but we're not using that so we'll need to do them here.
                // Setup and start the connection straight away.
                ideariumRPC.reconnectCount = 0;
                ideariumRPC.connect();

            } catch (e) {
                return done(e);
            }

        });

        it('can have custom timeout values', function (done) {

            this.timeout(15000);

            // Catch and proxy errors to `done`.
            try {

                // Setup an instance of the class.
                var ideariumRPC = new mq.RpcClient(conf.rabbitUrl, {}, 10000);

                // Add the connect listener. When this happens, we're done.
                ideariumRPC.addListener('queue', () => {

                    // If this timeout has executed, it means the original timeout should have executed.
                    setTimeout(() => done(), 7000);

                    ideariumRPC.publish('missing-rpc', {})
                        .then(() => done(new Error('Should not have been resolved.')))
                        .catch(() => done(new Error('Show not have been rejected.')));

                });

                // Listen for errors.
                ideariumRPC.addListener('error', done);

                // This usually comes from common/mq/client, but we're not using that so we'll need to do them here.
                // Setup and start the connection straight away.
                ideariumRPC.reconnectCount = 0;
                ideariumRPC.connect();

            } catch (e) {
                return done(e);
            }

        });

    });

});
