'use strict';

/* eslint-env node, mocha */

var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    request = require('supertest'),
    expect = require('chai').expect,
    mitm = require('mitm'),
    lib = require('../'),
    dir = path.resolve(__dirname, '..', 'logs');

/**
 * Helper function to create an instance of an Express app.
 * @return {Object} The Express app.
 */
function createApp () {
    return express();
}

/**
 * Helper function to create a supertest agent for testing the middleware with.
 * @param  {Object} app An Express app.
 * @return {Object}     A supertest agent which can be used to test the middelware.
 */
function createAgent (app) {
    return request.agent(app);
}

describe('middleware.logRequest', function () {

    // Sometimes there is a bit of lag when writing to the socket and file system.
    // Allow two retries on these tests.
    this.retries(2);

    // This is run after common-config and will have therefore cached the config from the previous test.
    before(function(done) {

        let config = require('../common/config');

        config.set('logLocation', 'local');
        config.set('logLevel', 'debug');
        config.set('logToStdout', false);
        config.set('logEntriesToken', '00000000-0000-0000-0000-000000000000');
        config.set('production', false);

        // Make the logs directory.
        fs.mkdir(dir, done);

    });

    it('is an Express middleware function', function () {

        expect(lib.middleware.logRequest).to.be.a('function');

    });

    it('will log locally to file', function (done) {

        let app = createApp();

        // Mount the middleware to log the request
        app.use(lib.middleware.logRequest);

        // Mount some middleware that will just continue.
        app.get('/', function (req, res, next) {
            return next();
        });

        // eslint-disable-next-line no-unused-vars
        app.get('/', function (req, res, next) {
            return res.status(200).end('OK');
        });

        // Run the test
        createAgent(app)
        .get('/')
        .expect(200, /OK/)
        // eslint-disable-next-line no-unused-vars
        .end(function (err, res) {

            // Was there an error.
            if (err) {
                return done(err);
            }

            // Now we should make sure the local file has some log data in it.
            // Verify the log exists.
            fs.readFile(path.join(process.cwd(), 'logs', 'request.log'), 'utf8', function (readErr, content) {

                // Handle any read errors
                if (readErr) {
                    return done(readErr);
                }

                // Check out results.
                expect(content).to.match(/idearium-lib:middleware:log-request/);
                expect(content).to.match(/"method":"GET"/);
                expect(content).to.match(/"url":"\/"/);

                // We're all done
                return done();

            });

        });

    });

    it('will not log excluded routes', function (done) {

        let app = createApp(),
            agent = createAgent(app),
            count = 0;

        // Mount the middleware to log the request
        app.use(lib.middleware.logRequest);

        // Mount some middleware that will just continue.
        app.get('/', function (req, res, next) {
            return next();
        });

        // eslint-disable-next-line no-unused-vars
        app.get('/', function (req, res, next) {
            count++;
            return res.status(200).end('OK');
        });

        // eslint-disable-next-line no-unused-vars
        app.get('/admin/public/file.txt', function (req, res, next) {
            count++;
            return res.status(200).end('OK');
        });

        // Run the test
        agent
        .get('/')
        .expect(200, /OK/)
        // eslint-disable-next-line no-unused-vars
        .end(function (err, res) {

            // Was there an error.
            if (err) {
                return done(err);
            }

            agent
            .get('/admin/public/file.txt')
            .expect(200, /OK/)
            // eslint-disable-next-line no-unused-vars
            .end(function (publicErr, publicRes) {

                if (publicErr) {
                    return done(publicErr);
                }

                // Now we should make sure the local file has some log data in it.
                // Verify the log exists.
                fs.readFile(path.join(process.cwd(), 'logs', 'request.log'), 'utf8', function (readErr, content) {

                    // Handle any read errors
                    if (readErr) {
                        return done(readErr);
                    }

                    // Make sure both middleware were executed
                    expect(count).to.eql(2);

                    // Check out results.
                    expect(content).to.match(/idearium-lib:middleware:log-request/);
                    expect(content).to.match(/"method":"GET"/);
                    expect(content).to.match(/"url":"\/"/);

                    // Shouldn't log the excluded routes
                    expect(content).to.not.match(/"url":"\/admin\/public\/file.txt"/);

                    // We're all done
                    return done();

                });

            });

        });

    });

    it('the username if it exists in req', function (done) {

        let app = createApp();

        // Mount the middleware to log the reuqest
        app.use(lib.middleware.logRequest);

        // Mount some middleware that will just continue.
        app.get('/user', function (req, res, next) {

            req.user = {
                username: 'foobar',
                _id: '000000000000'
            };

            return next();

        });

        // eslint-disable-next-line no-unused-vars
        app.get('/user', function (req, res, next) {
            return res.status(200).end('OK');
        });

        // Run the test
        createAgent(app)
        .get('/user')
        .expect(200, /OK/)
        // eslint-disable-next-line no-unused-vars
        .end(function (err, res) {

            // Was there an error.
            if (err) {
                return done(err);
            }

            // Now we should make sure the local file has some log data in it.
            // Verify the log exists.
            fs.readFile(path.join(process.cwd(), 'logs', 'request.log'), 'utf8', function (readErr, content) {

                // Handle any read errors
                if (readErr) {
                    return done(readErr);
                }

                // Check out results.
                expect(content).to.match(/idearium-lib:middleware:log-request/);
                expect(content).to.match(/"method":"GET"/);
                expect(content).to.match(/"url":"\/user"/);
                expect(content).to.match(/"username":"foobar"/);

                // We're all done
                return done();

            });

        });

    });

    it('remotely via a stream', function (done) {

        let app = createApp(),
            mock = mitm(),
            config = require('../common/config');

        // Update the config to log remotely
        config.set('logLocation', 'remote');

        // A proxy function used to ensure mock.disable is always run whenever this test calls `done`.
        function callDone () {
            mock.disable();
            done.apply(null, arguments);
        }

        // Don't intercept supertest requests, only the logging requests
        mock.on('connect', function (socket, opts) {
            if (opts.host === '127.0.0.1') {
                socket.bypass();
            }
        });

        // Intercept requests to the remote logging server, and check them.
        // eslint-disable-next-line no-unused-vars
        mock.on('connection', function (socket, opts) {
            socket.on('data', function (buffer) {

                var msg = buffer.toString();

                // Check out results.
                expect(msg).to.match(/idearium-lib:middleware:log-request/);
                expect(msg).to.match(/"method":"GET"/);
                expect(msg).to.match(/"url":"\/log-request-stream"/);

                return done();

            });
        });

        // Mount the middleware to log the reuqest
        app.use(lib.middleware.logRequest);

        // Mount some middleware that will just continue.
        app.get('/log-request-stream', function (req, res, next) {
            return next();
        });

        // eslint-disable-next-line no-unused-vars
        app.get('/log-request-stream', function (req, res, next) {
            return res.status(200).end('OK');
        });

        // Run the test
        createAgent(app)
        .get('/log-request-stream')
        .expect(200, /OK/)
        // eslint-disable-next-line no-unused-vars
        .end(function (err, res) {

            // Was there an error.
            if (err) {
                return callDone(err);
            }

        });

    });

    after(function (done) {
        fs.unlink(path.join(dir, 'request.log'), function (err) {

            if (err) {
                return done(err);
            }

            fs.rmdir(dir, done);

        });
    });

});
