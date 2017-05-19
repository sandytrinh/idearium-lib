
'use strict';

/* eslint-env node, mocha */

var path = require('path'),
    expect = require('chai').expect,
    copy = require('copy-dir'),
    rimraf = require('rimraf'),
    dir = path.resolve(__dirname),
    conf = require('./conf');

describe('RPC', function () {

    // This is run after common-config and will have therefore cached the config from the previous test.
    // Set the mqUrl value as common/mq/client uses it.
    before(function(done) {

        require('../common/config').set('mqUrl', conf.rabbitUrl);

        // Move the test files into place
        copy(path.resolve(dir, 'data', 'mq-certs'), path.join(dir, '..', 'mq-certs', process.env.NODE_ENV), done);

    });

    it('will send and receive messages', function (done) {

        this.timeout(10000);

        // Catch and proxy errors to `done`.
        try {

            //
            // Common
            //

            const data = {
                'boolean': true,
                'array': [],
                'object': {},
                'random': Math.floor(Math.random() * 40000)
            };

            const rpcName = 'rpc_server_name';

            //
            // Setup the server.
            //

            const reply = (msg, callback) => {

                const msgData = JSON.parse(msg.content.toString());
                expect(msgData).to.eql(data);
                callback(msg.content);

            };

            const RpcServer = require('../common/mq/rpc-server');

            const rpcServer = new RpcServer(rpcName, reply);

            // Listen for errors.
            rpcServer.addListener('error', done);

            //
            // Setup the client.
            //

            // Setup an instance of the class.
            const rpcClient = require('../common/mq/rpc-client');

            // Add the connect listener. When this happens, we're done.
            rpcClient.addListener('queue', () => {

                rpcClient.publish(rpcName, data)
                    .then((result) => {

                        const msgData = JSON.parse(result.content.toString());
                        expect(msgData).to.eql(data);
                        return done();

                    })
                    .catch(done);

            });

            // Listen for errors.
            rpcClient.addListener('error', done);

        } catch (e) {
            return done(e);
        }

    });

    after(function (done) {

        rimraf(path.join(dir, '..', 'mq-certs'), done);

    });

});
