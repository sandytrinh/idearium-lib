/* eslint-env node, mocha */

'use strict';

var path = require('path'),
    fs = require('fs'),
    chai = require('chai'),
    should = chai.should(), // eslint-disable-line no-unused-vars
    expect = chai.expect,
    lib = require('../'),
    dir = path.resolve(__dirname, 'lib');

describe('class Loader', function () {

    before(function(done) {
        fs.mkdir(dir, function (err) {
            if (err) {
                return done(err);
            }
            fs.writeFile(dir + '/log-exception.js', '', function (writeErr) {
                if (writeErr) {
                    return done(writeErr);
                }
                fs.writeFile(dir + '/log-request.js', '', done);
            });
        });
    });

    it('should throw, if the dir parameter is not provided', function () {

        return function () {
            return new lib.Config().load();
        }.should.throw(Error, /dir/);

    });

    describe('works asynchronously (promises)', function () {

        it('should load files', function (done) {

            var loader = new lib.Loader();

            loader.load(dir).then(function (files) {

                expect(files).to.have.all.keys('logException', 'logRequest');
                return done();

            });

        });

        it('should load files without camel case key names', function (done) {

            var loader = new lib.Loader();

            loader.camelCase = false;

            loader.load(dir).then(function (files) {

                expect(files).to.have.all.keys('log-exception', 'log-request');
                return done();

            });

        });

        it('should load files with class case key names', function (done) {

            var loader = new lib.Loader();

            loader.classCase = true;

            loader.load(dir).then(function (files) {

                expect(files).to.have.all.keys('LogException', 'LogRequest');
                return done();

            });

        });

    });

    describe('works synchronously', function () {

        // Create a synchronous instance of the loader.
        var loader = new lib.Loader();
        loader.sync = true;

        it('should load files', function () {
            expect(loader.load(dir)).to.have.all.keys('logException', 'logRequest');
        });

        it('should load files without camel case key names', function () {
            loader.camelCase = false;
            expect(loader.load(dir)).to.have.all.keys('log-exception', 'log-request');
        });

        it('should load files with class case key names', function () {
            loader.camelCase = true;
            loader.classCase = true;
            expect(loader.load(dir)).to.have.all.keys('LogException', 'LogRequest');
        });

    });

    after(function (done) {
        fs.unlink(dir + '/log-exception.js', function (err) {
            if (err) {
                return done(err);
            }
            fs.unlink(dir + '/log-request.js', function (deleteErr) {
                if (deleteErr) {
                    return done(deleteErr);
                }
                fs.rmdir(dir, done);
            });
        });
    });

});
