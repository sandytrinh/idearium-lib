/*eslint-env node, mocha */
/*eslint no-unused-expressions:0, no-mixed-requires:0, quotes: 0*/

'use strict';

var expect = require('chai').expect,
    path = require('path'),
    fs = require('fs'),
    lib = require('../'),
    dir = path.resolve(__dirname, '..', 'config');

describe('common/config', function () {

    let config;

    before(function(done) {
        fs.mkdir(dir, function (err) {
            if (err) {
                return done(err);
            }
            fs.writeFile(path.join(dir, 'config.development.js'), 'module.exports = { "title": "development" };', function (writeErr) {
                if (writeErr) {
                    return done(writeErr);
                }
                fs.writeFile(path.join(dir, 'config.json'), '{ "title": "default", "phone": 1234 }', function () {
                    config = require('../common/config');
                    return done();
                });
            });
        });
    });

    it('will load the config', function () {

        expect(config.get('title')).to.equal('development');
        expect(config.get('phone')).to.equal(1234);

        config.set('url', 'google.com');
        expect(config.get('url')).equal('google.com');

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
