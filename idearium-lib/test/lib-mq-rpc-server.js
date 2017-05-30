'use strict';

/* eslint-env node, mocha */

var expect = require('chai').expect,
    mq = require('..').mq,
    conf = require('./conf');

describe('class mq.RpcServer', function () {

    describe('will throw an Error', function () {

        it('if url is not provided', function () {

            var fn = function () {
                // eslint-disable-next-line no-unused-vars
                var ideariumMq = new mq.RpcServer();
            };

            expect(fn).to.throw(Error, /connectionString parameter is required/);

        });

        it('if name is not provided', function () {

            var fn = function () {
                // eslint-disable-next-line no-unused-vars
                var ideariumMq = new mq.RpcServer(conf.rabbitUrl);
            };

            expect(fn).to.throw(Error, /You must supply an RPC name/);

        });

        it('if callback is not provided', function () {

            var fn = function () {
                // eslint-disable-next-line no-unused-vars
                var ideariumMq = new mq.RpcServer(conf.rabbitUrl, 'test_name');
            };

            expect(fn).to.throw(Error, /You must supply a callback function/);

        });

    });

    describe('connects to', function () {

        it('RabbitMQ and gracefully disconnects', function (done) {

            this.timeout(10000);

            const name = 'test_server_queue';
            const callback = () => {};

            // Catch and proxy errors to `done`.
            try {

                // Setup an instance of the class.
                var ideariumRPC = new mq.RpcServer(conf.rabbitUrl, name, callback);

                // Add the connect listener. When this happens, we're done.
                ideariumRPC.addListener('channel', () => {

                    ideariumRPC.disconnect()
                        .then(() => done())
                        .catch(done);

                });

                // Listen for errors.
                ideariumRPC.addListener('error', done);

                // This usually comes from common/mq/client, but we're not using that so we'll need to do them here.
                // Setup and start the connection straight away.
                ideariumRPC.reconnectCount = 0;
                ideariumRPC.connect()
                    .catch(done);

            } catch (e) {
                return done(e);
            }

        });

    });

});
