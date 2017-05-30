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

            this.timeout(6000);

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

            this.timeout(2000);

            // Catch and proxy errors to `done`.
            try {

                // Setup an instance of the class.
                var ideariumRPC = new mq.RpcClient(conf.rabbitUrl, {}, 1000);

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

        describe('can have', function () {

            it('custom global timeout values', function (done) {

                this.timeout(1000);

                // Catch and proxy errors to `done`.
                try {

                    // Setup an instance of the class.
                    const ideariumRPC = new mq.RpcClient(conf.rabbitUrl, {}, 500);
                    const now = process.hrtime();

                    // Add the connect listener. When this happens, we're done.
                    ideariumRPC.addListener('queue', () => {

                        ideariumRPC.publish('missing-rpc', {})
                            .then(() => done(new Error('Should not have been resolved.')))
                            .catch(() => {

                                expect(process.hrtime(now)[1]/1000000).to.be.below(600);

                                done();

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

            it('timeout values specific to RPC', function (done) {

                this.timeout(4000);

                // Catch and proxy errors to `done`.
                try {

                    // Setup an instance of the class.
                    // Global timeout of 10000
                    const ideariumRPC = new mq.RpcClient(conf.rabbitUrl, {}, 2000);
                    const now = process.hrtime();
                    let firstTimeout = false;
                    let secondTimeout = false;

                    // Add the connect listener. When this happens, we're done.
                    ideariumRPC.addListener('queue', () => {

                        ideariumRPC.publish('missing-rpc-1', {})
                            .then(() => done(new Error('Should not have been resolved.')))
                            .catch((err) => {

                                firstTimeout = true;

                                expect(secondTimeout).to.be.true;

                                expect(err).to.be.an.instanceof(Error);
                                expect(err.message).to.match(/RPC timed out \(missing-rpc-1/);

                                return done();

                            });

                        ideariumRPC.publish('missing-rpc-2', {}, 500)
                            .then(() => done(new Error('Should not have been resolved.')))
                            .catch((err) => {

                                secondTimeout = true;

                                expect(firstTimeout).to.be.false;
                                expect(process.hrtime(now)[1]/1000000).to.be.below(600);

                                expect(err).to.be.an.instanceof(Error);
                                expect(err.message).to.match(/RPC timed out \(missing-rpc-2/);

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

        });

    });

});
