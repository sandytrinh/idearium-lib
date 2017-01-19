/* eslint-env node, mocha */

'use strict';

const path = require('path'),
    fs = require('fs'),
    expect = require('chai').expect,
    dir = path.resolve(__dirname, '..', 'messages');

describe('common/mq/messages', function () {

    let message;

    // This is run after common-mq-client and will have therefore cached the config from the previous test.
    // Set the mqUrl value as common/mq/client uses it.
    before(function(done) {

        require('../common/config').set('mqUrl', 'amqp://lib:lib@localhost:5672');

        // Add some fake messages to load.
        fs.mkdir(dir, function (err) {

            // If it already exists, that's fine, let's just create the file itself.
            if (err) {
                return done(err);
            }

            fs.writeFile(path.join(dir, 'test.js'), 'module.exports = { "consume": function () {}, "publish": function () {} };', function (writeErr) {

                if (writeErr) {
                    return done(writeErr);
                }

                message = require('../messages/test.js');

                return done();

            });

        });

    });

    // it('will load consumers', function (done) {
    //
    //     // Let's make use of require caching here. We'll require test.js ahead of time and update
    //     // the function, to a local one that has access to done.
    //     message.consume = done;
    //
    //     // Catch and proxy any errors to `done`.
    //     try {
    //         // eslint-disable-next-line no-unused-vars
    //         var mqMessages = require('../common/mq/messages');
    //     } catch (e) {
    //         return done(e);
    //     }
    //
    // });

    it('will faciliate producing and consuming messages', function (done) {

        this.retries(2);
        this.timeout(4000);

        var exchange = 'common-mq-messages',
            queueName = 'common-mq-messages-queue',
            mqClient = require('../common/mq/client');

        // Recreate the consume function.
        message.consume = function () {

            mqClient.consume((channel) => {

                var processMessage = (msg) => {

                        // For the purpose of this test case, instantly acknowledge the message.
                        channel.ack(msg);

                        // Try and pass the data.
                        try {
                            var data = JSON.parse(msg.content.toString());
                        } catch (e) {
                            return done(e);
                        }

                        if (!data) {
                            return done(new Error('There was no data'));
                        }

                        expect(data).to.eql({'common-mq-messages-test': true});

                        return done();

                    };

                // create exchange, durable make sure exchange will persist to disk
                return channel.assertExchange(exchange, 'fanout', { durable: true })
                .then(() => {
                    // create queue, durable make sure queue will persist to disk
                    return channel.assertQueue(queueName, { durable: true });
                })
                .then(() => {
                    // bind queue to exchange, with empty string as the routing key since the exchange type is 'fanout'
                    return channel.bindQueue(queueName, exchange, '');
                })
                .then(() => {
                    // consume and process the message, noAck tells rabbitmq to wait for aknowledgement
                    return channel.consume(queueName, processMessage, { noAck: false });
                });

            });

        };

        // Create the publish function.
        message.publish = function (data) {

            // Publish anything we receive into RabbitMQ.
            mqClient.publish((channel) => {

                // create exchange, durable make sure exchange will persist to disk
                return channel.assertExchange(exchange, 'fanout', { durable: true })
                .then(() => {
                    // publish message to exchange, persistent settings ensure message is saved to disk in case of server failure
                    return channel.publish(exchange, '', new Buffer(JSON.stringify(data)), { persistent: true });
                });

            });

        };

        // Catch and proxy any errors to `done`.
        try {

            // This will be cached.
            var mqMessages = require('../common/mq/messages');

            // Run this manually, as it will have already run once.
            mqMessages.registerConsumers();

            // Publish a test message.
            require('../messages/test.js').publish({'common-mq-messages-test': true});

        } catch (e) {
            return done(e);
        }

    });

    after(function (done) {
        fs.unlink(path.join(dir, 'test.js'), function () {
            fs.rmdir(dir, done);
        });
    });

});
