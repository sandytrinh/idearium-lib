'use strict';

/* eslint-env node, mocha */
/* eslint no-unused-vars:0 */

const path = require('path'),
    fs = require('fs'),
    mitm = require('mitm'),
    stderr = require('test-console').stderr,
    chai = require('chai'),
    expect = chai.expect,
    logs = require('../').logs,
    dir = path.resolve(__dirname, '..', 'logs'),
    rimraf = require('rimraf');

describe('class logs.Logger', function () {

    before(function (done) {

        // Create the directory for the logger
        rimraf('../logs', () => {

            if (fs.existsSync(dir)) {
                return done();
            }

            return fs.mkdir(dir, done);

        });

    });

    describe('instantiation', function () {

        it('can be instantiated', function () {

            expect(function () {
                let log = new logs.Logger('name', 'token');
            }).to.not.throw;

        });

        describe('will throw if', function () {

            it('name parameter is not provided', function () {

                expect(function () {
                    let log = new logs.Logger();
                }).to.throw(Error, /name/);

            });

            it('context parameter is not provided', function () {

                expect(function () {
                    let log = new logs.Logger({
                        name: 'test'
                    });
                }).to.throw(Error, /context/);

            });

            it('level is wrong', function () {

                expect(function () {
                    let log = new logs.Logger({
                        name: 'name',
                        context: 'context',
                        level: 'warning'
                    });
                }).to.throw(Error, /level/);

            });

            it('remote specified, without token parameter', function () {

                expect(function () {
                    let log = new logs.Logger({
                        name: 'name',
                        context: 'context',
                        remote: true
                    });
                }).to.throw(Error, /token/);

            });

        });

    });

    describe('file stream', function () {

        // Sometimes there is a bit of lag when writing to the file system.
        // Allow two retries on these tests.
        this.retries(2);

        // Empty the file after each test.
        afterEach(function (done) {
            fs.truncate(path.join(dir, 'application.log'), done);
        });

        it('will write to file', function (done) {

            // Create the logger.
            let logger = new logs.Logger({
                name: 'application',
                context: 'write-to-file-test'
            });

            // Write content to the log.
            logger.error('Testing write to file');

            // Verify the log exists.
            fs.readFile(path.join(dir, 'application.log'), 'utf8', function (err, content) {

                // Handle any errors
                if (err) {
                    return done(err);
                }

                // Check out results.
                expect(content).to.match(/Testing write to file/);
                expect(content).to.match(/write-to-file/);

                return done();

            });

        });

        describe('at levels', function () {

            let logger;

            before(function () {

                // Init the logger.
                logger = new logs.Logger({
                    name: 'application',
                    context: 'at-levels-test',
                    level: 'trace'
                });

            });

            it('trace', function (done) {

                logger.trace('Logging at trace level');

                // Verify the log exists.
                fs.readFile(path.join(dir, 'application.log'), 'utf8', function (err, content) {

                    // Handle any errors
                    if (err) {
                        return done(err);
                    }

                    // Check out results.
                    expect(content).to.match(/Logging at trace level/);
                    expect(content).to.match(/at-levels-test/);
                    expect(content).to.match(/"level":10/);

                    return done();

                });

            });

            it('debug', function (done) {

                logger.debug('Logging at debug level');

                // Verify the log exists.
                fs.readFile(path.join(dir, 'application.log'), 'utf8', function (err, content) {

                    // Handle any errors
                    if (err) {
                        return done(err);
                    }

                    // Check out results.
                    expect(content).to.match(/Logging at debug level/);
                    expect(content).to.match(/at-levels-test/);
                    expect(content).to.match(/"level":20/);

                    return done();

                });

            });

            it('info', function (done) {

                logger.info('Logging at info level');

                // Verify the log exists.
                fs.readFile(path.join(dir, 'application.log'), 'utf8', function (err, content) {

                    // Handle any errors
                    if (err) {
                        return done(err);
                    }

                    // Check out results.
                    expect(content).to.match(/Logging at info level/);
                    expect(content).to.match(/at-levels-test/);
                    expect(content).to.match(/"level":30/);

                    return done();

                });

            });

            it('warn', function (done) {

                logger.warn('Logging at warn level');

                // Verify the log exists.
                fs.readFile(path.join(dir, 'application.log'), 'utf8', function (err, content) {

                    // Handle any errors
                    if (err) {
                        return done(err);
                    }

                    // Check out results.
                    expect(content).to.match(/Logging at warn level/);
                    expect(content).to.match(/at-levels-test/);
                    expect(content).to.match(/"level":40/);

                    return done();

                });

            });

            it('error', function (done) {

                logger.error('Logging at error level');

                // Verify the log exists.
                fs.readFile(path.join(dir, 'application.log'), 'utf8', function (err, content) {

                    // Handle any errors
                    if (err) {
                        return done(err);
                    }

                    // Check out results.
                    expect(content).to.match(/Logging at error level/);
                    expect(content).to.match(/at-levels-test/);
                    expect(content).to.match(/"level":50/);

                    return done();

                });

            });

            it('fatal', function (done) {

                logger.fatal('Logging at fatal level');

                // Verify the log exists.
                fs.readFile(path.join(dir, 'application.log'), 'utf8', function (err, content) {

                    // Handle any errors
                    if (err) {
                        return done(err);
                    }

                    // Check out results.
                    expect(content).to.match(/Logging at fatal level/);
                    expect(content).to.match(/at-levels-test/);
                    expect(content).to.match(/"level":60/);

                    return done();

                });

            });

        });

    });

    describe('stderr stream', function () {

        it('will write to stderr', function (done) {

            // Create the logger.
            let logger = new logs.Logger({
                name: 'application',
                context: 'lib:logger:write-to-stderr-test',
                local: false,
                stdErr: true
            });

            // Write content to the log.
            let output = stderr.inspectSync(function () {
                logger.error('Testing write to stderr');
            });

            expect(Array.isArray(output)).to.be.true;
            expect(output).to.have.length(1);
            expect(output[0]).to.match(/lib:logger:write-to-stderr-test/);
            expect(output[0]).to.match(/"name":"application"/);
            expect(output[0]).to.match(/Testing write to stderr/);

            return done();

        });

        describe('at levels', function () {

            let logger;

            before(function () {

                // Init the logger.
                logger = new logs.Logger({
                    name: 'application',
                    context: 'lib:logger:stderr-at-levels-test',
                    level: 'trace',
                    local: false,
                    stdErr: true
                });

            });

            it('trace', function (done) {

                // Write content to the log.
                let output = stderr.inspectSync(function () {
                    logger.trace('Testing write to stderr');
                });

                expect(Array.isArray(output)).to.be.true;
                expect(output).to.have.length(1);
                expect(output[0]).to.match(/lib:logger:stderr-at-levels-test/);
                expect(output[0]).to.match(/"name":"application"/);
                expect(output[0]).to.match(/"level":10/);
                expect(output[0]).to.match(/Testing write to stderr/);

                return done();

            });

            it('debug', function (done) {

                // Write content to the log.
                let output = stderr.inspectSync(function () {
                    logger.debug('Testing write to stderr');
                });

                expect(Array.isArray(output)).to.be.true;
                expect(output).to.have.length(1);
                expect(output[0]).to.match(/lib:logger:stderr-at-levels-test/);
                expect(output[0]).to.match(/"name":"application"/);
                expect(output[0]).to.match(/"level":20/);
                expect(output[0]).to.match(/Testing write to stderr/);

                return done();

            });

            it('info', function (done) {

                // Write content to the log.
                let output = stderr.inspectSync(function () {
                    logger.info('Testing write to stderr');
                });

                expect(Array.isArray(output)).to.be.true;
                expect(output).to.have.length(1);
                expect(output[0]).to.match(/lib:logger:stderr-at-levels-test/);
                expect(output[0]).to.match(/"name":"application"/);
                expect(output[0]).to.match(/"level":30/);
                expect(output[0]).to.match(/Testing write to stderr/);

                return done();

            });

            it('warn', function (done) {

                // Write content to the log.
                let output = stderr.inspectSync(function () {
                    logger.warn('Testing write to stderr');
                });

                expect(Array.isArray(output)).to.be.true;
                expect(output).to.have.length(1);
                expect(output[0]).to.match(/lib:logger:stderr-at-levels-test/);
                expect(output[0]).to.match(/"name":"application"/);
                expect(output[0]).to.match(/"level":40/);
                expect(output[0]).to.match(/Testing write to stderr/);

                return done();

            });

            it('error', function (done) {

                // Write content to the log.
                let output = stderr.inspectSync(function () {
                    logger.error('Testing write to stderr');
                });

                expect(Array.isArray(output)).to.be.true;
                expect(output).to.have.length(1);
                expect(output[0]).to.match(/lib:logger:stderr-at-levels-test/);
                expect(output[0]).to.match(/"name":"application"/);
                expect(output[0]).to.match(/"level":50/);
                expect(output[0]).to.match(/Testing write to stderr/);

                return done();

            });

            it('fatal', function (done) {

                // Write content to the log.
                let output = stderr.inspectSync(function () {
                    logger.fatal('Testing write to stderr');
                });

                expect(Array.isArray(output)).to.be.true;
                expect(output).to.have.length(1);
                expect(output[0]).to.match(/lib:logger:stderr-at-levels-test/);
                expect(output[0]).to.match(/"name":"application"/);
                expect(output[0]).to.match(/"level":60/);
                expect(output[0]).to.match(/Testing write to stderr/);

                return done();

            });

        });

    });

    describe('remote stream', function () {

        let mock;

        beforeEach(function () {
            mock = mitm();
        });

        afterEach(function () {
            mock.disable();
        });

        it('will write to log entries', function (done) {

            // Create the logger.
            let logger = new logs.Logger({
                    name: 'application',
                    context: 'lib:logger:write-to-remote-test',
                    local: false,
                    stdErr: false,
                    remote: true,
                    token: '00000000-0000-0000-0000-000000000000'
                });

            mock.on('connection', function (socket, opts) {
                socket.on('data', function (buffer) {

                    var msg = buffer.toString();

                    // Check out results.
                    expect(msg).to.match(/Testing write to remote/);
                    expect(msg).to.match(/lib:logger:write-to-remote-test/);
                    expect(msg).to.match(/"level":50/);

                    return done();

                });
            });

            // Write content to the log.
            logger.error('Testing write to remote');

        });

        describe('at levels', function () {

            let logger;

            beforeEach(function () {

                // Create the logger.
                logger = new logs.Logger({
                    name: 'application',
                    context: 'lib:logger:write-to-remote-at-levels-test',
                    level: 'trace',
                    local: false,
                    stdErr: false,
                    remote: true,
                    token: '00000000-0000-0000-0000-000000000000'
                });

            });

            it('trace', function (done) {

                mock.on('connection', function (socket, opts) {
                    socket.on('data', function (buffer) {

                        var msg = buffer.toString();

                        // Check out results.
                        expect(msg).to.match(/Testing write to remote at levels/);
                        expect(msg).to.match(/lib:logger:write-to-remote-at-levels-test/);
                        expect(msg).to.match(/"level":10/);

                        return done();

                    });
                });

                // Write content to the log.
                logger.trace('Testing write to remote at levels');

            });

            it('debug', function (done) {

                mock.on('connection', function (socket, opts) {
                    socket.on('data', function (buffer) {

                        var msg = buffer.toString();

                        // Check out results.
                        expect(msg).to.match(/Testing write to remote at levels/);
                        expect(msg).to.match(/lib:logger:write-to-remote-at-levels-test/);
                        expect(msg).to.match(/"level":20/);

                        return done();

                    });
                });

                // Write content to the log.
                logger.debug('Testing write to remote at levels');

            });

            it('info', function (done) {

                mock.on('connection', function (socket, opts) {
                    socket.on('data', function (buffer) {

                        var msg = buffer.toString();

                        // Check out results.
                        expect(msg).to.match(/Testing write to remote at levels/);
                        expect(msg).to.match(/lib:logger:write-to-remote-at-levels-test/);
                        expect(msg).to.match(/"level":30/);

                        return done();

                    });
                });

                // Write content to the log.
                logger.info('Testing write to remote at levels');

            });

            it('warn', function (done) {

                mock.on('connection', function (socket, opts) {
                    socket.on('data', function (buffer) {

                        var msg = buffer.toString();

                        // Check out results.
                        expect(msg).to.match(/Testing write to remote at levels/);
                        expect(msg).to.match(/lib:logger:write-to-remote-at-levels-test/);
                        expect(msg).to.match(/"level":40/);

                        return done();

                    });
                });

                // Write content to the log.
                logger.warn('Testing write to remote at levels');

            });

            it('error', function (done) {

                mock.on('connection', function (socket, opts) {
                    socket.on('data', function (buffer) {

                        var msg = buffer.toString();

                        // Check out results.
                        expect(msg).to.match(/Testing write to remote at levels/);
                        expect(msg).to.match(/lib:logger:write-to-remote-at-levels-test/);
                        expect(msg).to.match(/"level":50/);

                        return done();

                    });
                });

                // Write content to the log.
                logger.error('Testing write to remote at levels');

            });

            it('fatal', function (done) {

                mock.on('connection', function (socket, opts) {
                    socket.on('data', function (buffer) {

                        var msg = buffer.toString();

                        // Check out results.
                        expect(msg).to.match(/Testing write to remote at levels/);
                        expect(msg).to.match(/lib:logger:write-to-remote-at-levels-test/);
                        expect(msg).to.match(/"level":60/);

                        return done();

                    });
                });

                // Write content to the log.
                logger.fatal('Testing write to remote at levels');

            });

        });

    });

    describe('custom stream', function () {

        it('will write to a custom stream', function (done) {

            // Basic es6 class to act as a Bunyan stream.
            const CustomStream = class {

                constructor () {

                    return {
                        name: 'application',
                        level: 'trace',
                        type: 'raw',
                        stream: this
                    }

                }

                write (rec) {

                    expect(rec.name).to.equal('application');
                    expect(rec.context).to.equal('lib:logger:custom-stream');
                    expect(rec.msg).to.equal('Testing custom stream');

                    return done();

                }

            };

            let logger = new logs.Logger({
                name: 'application',
                context: 'lib:logger:custom-stream',
                level: 'trace',
                local: false,
                stdErr: false,
                remote: false,
                streams: [new CustomStream()]
            });

            logger.info('Testing custom stream');

        });

    });

    describe('file, stderr, remote and custom stream', function () {

        let CustomStream,
            logger,
            output,
            mock,
            msg,
            rec;

        before(function () {

            // Init the stream class.
            // Basic es6 class to act as a Bunyan stream.
            CustomStream = class {

                constructor () {

                    return {
                        name: 'application',
                        level: 'trace',
                        type: 'raw',
                        stream: this
                    }

                }

                write (_rec) {
                    rec = _rec;
                }

            };

            // Init the logger.
            logger = new logs.Logger({
                name: 'application',
                context: 'lib:logger:file-and-stderr-and-remote-test',
                level: 'trace',
                local: true,
                stdErr: true,
                remote: true,
                token: '00000000-0000-0000-0000-000000000000',
                streams: [new CustomStream()]
            });

            // Catch the HTTP requests.
            mock = mitm();

            mock.on('connection', function (socket, opts) {
                socket.on('data', function (buffer) {
                    msg = buffer.toString();
                    mock.disable();
                });
            });

            // Write content to the log.
            output = stderr.inspectSync(function () {
                logger.info('This is a combined output test');
            });

        });

        it('will output to file stream', function (done) {

            // Verify the log exists.
            fs.readFile(path.join(dir, 'application.log'), 'utf8', function (err, content) {

                // Handle any errors
                if (err) {
                    return done(err);
                }

                // Check out results.
                expect(content).to.match(/This is a combined output test/);
                expect(content).to.match(/lib:logger:file-and-stderr-and-remote-test/);
                expect(content).to.match(/"level":30/);

                return done();

            });

        });

        it('will output to stderr stream', function () {

            expect(Array.isArray(output)).to.be.true;
            expect(output).to.have.length(1);
            expect(output[0]).to.match(/lib:logger:file-and-stderr-and-remote-test/);
            expect(output[0]).to.match(/"name":"application"/);
            expect(output[0]).to.match(/"level":30/);
            expect(output[0]).to.match(/This is a combined output test/);

        });

        it('will send to remote logging platform', function (done) {

            var _done = false;

            setInterval(function () {

                // Wait until msg has been defined.
                if (msg && !_done) {

                    // Check out results.
                    expect(msg).to.match(/This is a combined output test/);
                    expect(msg).to.match(/lib:logger:file-and-stderr-and-remote-test/);
                    expect(msg).to.match(/"name":"application"/);
                    expect(msg).to.match(/"level":30/);

                    _done = true;

                    return done();

                }

            }, 100);

        });

        it('will log via custom stream', function (done) {

            var _done = false;

            setInterval(function () {

                // Wait until msg has been defined.
                if (rec && !_done) {

                    // Check out results.
                    expect(rec.msg).to.equal('This is a combined output test');
                    expect(rec.context).to.equal('lib:logger:file-and-stderr-and-remote-test');
                    expect(rec.name).to.equal('application');
                    expect(rec.level).to.equal(30);

                    _done = true;

                    return done();

                }

            }, 100);

        });

    });

    after(function (done) {
        rimraf('../logs', done);
    });

});
