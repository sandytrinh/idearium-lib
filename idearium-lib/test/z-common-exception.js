'use strict';

/* eslint-env node, mocha */

var fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    mitm = require('mitm'),
    dir = path.resolve(__dirname, '..', 'logs'),
    mocha = require('mocha');

// This is some dodgy code, but required to allow uncaught exception testing with Mocha.
// This is why this file is prefixed with `z-` so that it runs last.
// See https://github.com/mochajs/mocha/issues/1985
let _runTest = mocha.Runner.prototype.runTest;
mocha.Runner.prototype.runTest = function () {
    this.allowUncaught = true;
    _runTest.apply(this, arguments);
}

/**
 * A function that will clear any uncaughtException listeners and return a function to restore them.
 * @return {Object} An object with a restore function to restore the uncaughtException listeners.
 */
function clearExceptions () {

    let listeners = process.listeners('uncaughtException');

    process.removeAllListeners('uncaughtException');

    return {
        restore: function () {
            listeners.forEach(function (fn) {
                process.on('uncaughtException', fn);
            });
        }
    }

}

describe('common/exception', function () {

    // This is run after common-config and will have therefore cached the config from the previous test.
    before(function(done) {

        let config = require('../common/config');

        // Reset the configuration.
        config.set('logLocation', 'local');
        config.set('logLevel', 'debug');
        config.set('logToStdout', false);
        config.set('logEntriesToken', '00000000-0000-0000-0000-000000000000');
        config.set('production', false);

        // Make the logs directory.
        fs.mkdir(dir, done);

    });

    it('is a function', function () {
        expect(require('../common/exception')).to.be.a('function');
    });

    it('will log locally to file', function (done) {

        // We need some special setup here, so we can test uncaught exceptions.
        // Mocha has a reliance on it, so we need to temporarily dismantle it.
        let existing = clearExceptions();

        // Create an uncaught exception handler, that will unwind everything that
        // clearExceptions() changed and actually execute the test.
        let uncaughtExceptionHandler =  function () {

            // Remove the exception handler we added.
            process.removeAllListeners('uncaughtException');

            // Restore the previous ones (i.e. mocha).
            existing.restore();

            // Proxy the request across to the exception handler function we're actually testing.
            require('../common/exception').apply(this, arguments);

            // Now we should make sure the local file has some log data in it.
            // Verify the log exists.
            fs.readFile(path.join(process.cwd(), 'logs', 'exception.log'), 'utf8', function (readErr, content) {

                // Handle any read errors
                if (readErr) {
                    return done(readErr);
                }

                // Check out results.
                expect(content).to.match(/An exception error/);

                // We're all done
                return done();

            });

        }

        // Mount our uncaught exception handler.
        process.on('uncaughtException', uncaughtExceptionHandler);

        // Craete a function, that will throw an error to be caught.
        let fn = function () {
            throw new Error('An exception error');
        }

        // Execute the function to start the test.
        fn();

    });

    it('will log remotely via a stream', function (done) {

        // Reset the configuration to log remotely.
        let config = require('../common/config');
        config.set('logLocation', 'remote');

        // We need some special setup here, so we can test uncaught exceptions.
        // Mocha has a reliance on it, so we need to temporarily dismantle it.
        let mock = mitm(),
            existing = clearExceptions();

        // A proxy function used to ensure mock.disable is always run whenever this test calls `done`.
        function callDone () {
            mock.disable();
            done.apply(null, arguments);
        }

        // Intercept requests to the remote logging server, and check them.
        // eslint-disable-next-line no-unused-vars
        mock.on('connection', function (socket, opts) {
            socket.on('data', function (buffer) {

                let msg = buffer.toString();

                // Check out results.
                expect(msg).to.match(/A remote exception/);
                expect(msg).to.match(/idearium-lib:common:exception/);
                expect(msg).to.match(/"level":60/);

                return callDone();

            });
        });

        // Create an uncaught exception handler, that will unwind everything that
        // clearExceptions() changed and actually execute the test.
        let uncaughtExceptionHandler =  function () {

            // Remove the exception handler we added.
            process.removeAllListeners('uncaughtException');

            // Restore the previous ones (i.e. mocha).
            existing.restore();

            // Proxy the request across to the exception handler function we're actually testing.
            require('../common/exception').apply(this, arguments);

        }

        // Mount our uncaught exception handler.
        process.on('uncaughtException', uncaughtExceptionHandler);

        // Craete a function, that will throw an error to be caught.
        let fn = function () {
            throw new Error('A remote exception');
        }

        // Execute the function to start the test.
        fn();

    });

    after(function (done) {

        mocha.Runner.prototype.runTest = _runTest;

        fs.unlink(path.join(dir, 'exception.log'), function (err) {

            if (err) {
                return done(err);
            }

            fs.rmdir(dir, done);

        });

    });

});
