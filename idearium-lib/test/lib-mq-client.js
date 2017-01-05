/*eslint-env node, mocha */
/*eslint no-unused-expressions:0, no-mixed-requires:0, quotes: 0*/

var expect = require('chai').expect,
    path = require('path'),
    fs = require('fs'),
    dir = path.resolve(__dirname, 'config-common-mq'),
    mq = require('..').mq;

describe('class mq.Client', function () {

    before(function(done) {
        fs.mkdir(dir, function (err) {
            if (err) {
                return done(err);
            }
            fs.writeFile(dir + '/config.development.js', 'module.exports = { "mqUrl": "amqp://localhost:5672" };', function (writeErr) {
                if (writeErr) {
                    return done(writeErr);
                }
                fs.writeFile(dir + '/config.json', '{ "config": true }', done);
            });
        });
    });

    describe('will throw an Error', function () {

        it('if url is not provided', function () {

            var fn = function () {
                var ideariumMq = new mq.Client();
            };

            expect(fn).to.throw(Error, /url parameter is required/);

        });

    });

    describe('connects to', function () {

        it('RabbitMQ', function (done) {

            this.timeout(10000);

            // Catch and proxy errors to `done`.
            try {

                // Setup an instance of the class.
                var ideariumMq = new mq.Client('amqp://lib:lib@localhost:5672');

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

    after(function (done) {
        fs.unlink(dir + '/config.development.js', function (err) {
            if (err) {
                return done(err);
            }
            fs.unlink(dir + '/config.json', function (deleteErr) {
                if (deleteErr) {
                    return done(deleteErr);
                }
                fs.rmdir(dir, done);
            });
        });
    });

});
