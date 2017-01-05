/*eslint-env node, mocha */
/*eslint no-unused-expressions:0, no-mixed-requires:0, quotes: 0*/

var expect = require('chai').expect,
    path = require('path'),
    fs = require('fs'),
    lib = require('../'),
    dir = path.resolve(__dirname, 'config-lib-common');

describe('class Config', function () {

    before(function(done) {
        fs.mkdir(dir, function (err) {
            if (err) {
                return done(err);
            }
            fs.writeFile(dir + '/config.development.js', 'module.exports = { "title": "development" };', function (writeErr) {
                if (writeErr) {
                    return done(writeErr);
                }
                fs.writeFile(dir + '/config.json', '{ "title": "default", "phone": 1234 }', done);
            });
        });
    });

    describe('create an instance', function () {

        it('should failed, if the dir parameter is not provided', function () {

            expect(function () {
                return new lib.Config();
            }).to.throw(Error);

        });

        it('should load the config files from the provided dir', function () {

            var config = new lib.Config(dir);

            expect(config.get('title')).to.equal('development');
            expect(config.get('phone')).to.equal(1234);

        });

        it('should set and get a keyed value', function () {

            var config = new lib.Config(dir);

            config.set('url', 'google.com');
            expect(config.get('url')).equal('google.com');

        });

    });

    describe('create multiple instance', function () {

        it('should work', function () {

            var config1 = new lib.Config(dir),
                config2 = new lib.Config(dir);

            config1.set('hello', 'config1');
            config2.set('hello', 'config2');

            expect(config1.get('hello')).to.equal('config1');
            expect(config2.get('hello')).to.equal('config2');

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
