'use strict';

/* eslint-env node, mocha */

var expect = require('chai').expect,
    mq = require('..').mq,
    conf = require('./conf');

describe('class mq.RPC', function () {

    describe('will throw an Error', function () {

        it('if url is not provided', function () {

            var fn = function () {
                // eslint-disable-next-line no-unused-vars
                var ideariumMq = new mq.RPC();
            };

            expect(fn).to.throw(Error, /connectionString parameter is required/);

        });

        it('if type === server and name is not provided', function () {

            var fn = function () {
                // eslint-disable-next-line no-unused-vars
                var ideariumMq = new mq.RPC(conf.rabbitUrl, "server");
            };

            expect(fn).to.throw(Error, /You must supply an RPC name in the options object, when type is server/);

        });

    });

    describe('connects to', function () {

        // it('RabbitMQ', function (done) {
        //
        //     this.timeout(10000);
        //
        //     const name = 'test_server_queue';
        //     const callback = () => {};
        //
        //     // Catch and proxy errors to `done`.
        //     try {
        //
        //         // Setup an instance of the class.
        //         var ideariumMq = new mq.RPC(conf.rabbitUrl, 'server', { name, callback });
        //
        //         // Add the connect listener. When this happens, we're done.
        //         ideariumMq.addListener('channel', () => {
        //
        //             console.log('Channel connected, so now were closing.');
        //             console.log(ideariumMq);
        //
        //             ideariumMq.channel.deleteQueue(name)
        //                 .then(() => ideariumMq.channel.close())
        //                 .then(() => ideariumMq.disconnect())
        //                 .then(() => done())
        //                 .catch(done);
        //
        //         });
        //
        //         // Listen for errors.
        //         ideariumMq.addListener('error', done);
        //
        //         // This usually comes from common/mq/client, but we're not using that so we'll need to do them here.
        //         // Setup and start the connection straight away.
        //         ideariumMq.reconnectCount = 0;
        //         ideariumMq.connect()
        //             .catch(done);
        //
        //     } catch (e) {
        //         return done(e);
        //     }
        //
        // });

        // it('RabbitMQ', function (done) {
        //
        //     this.timeout(10000);
        //
        //     // Catch and proxy errors to `done`.
        //     try {
        //
        //         // Setup an instance of the class.
        //         var ideariumMq = new mq.RPC(conf.rabbitUrl, 'server', { name: 'test_server_queue', callback: () => {} });
        //
        //         // Add the connect listener. When this happens, we're done.
        //         ideariumMq.addListener('channel', () => {
        //
        //             ideariumMq.channel.checkQueue()
        //                 .then(done)
        //                 .catch(done);
        //
        //         });
        //
        //         // Listen for errors.
        //         ideariumMq.addListener('error', done);
        //
        //         // This usually comes from common/mq/client, but we're not using that so we'll need to do them here.
        //         // Setup and start the connection straight away.
        //         ideariumMq.reconnectCount = 0;
        //         ideariumMq.connect();
        //
        //     } catch (e) {
        //         return done(e);
        //     }
        //
        // });

    });

});
