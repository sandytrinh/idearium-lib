/* eslint-env node, mocha */

'use strict';

var expect = require('chai').expect,
    path = require('path'),
    fs = require('fs'),
    dir = path.resolve(__dirname, '..', 'config');

describe('common/config', function () {

    let config;

    before(function(done) {
        fs.mkdir(dir, function (err) {
            if (err) {
                return done(err);
            }
            fs.writeFile(dir + '/config.js', 'module.exports = { "title": "development", "phone": 1234 };', function () {
                config = require('../common/config');
                return done();
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
        fs.unlink(dir + '/config.js', function (err) {
            if (err) {
                return done(err);
            }
            fs.rmdir(dir, done);
        });
    });

});
