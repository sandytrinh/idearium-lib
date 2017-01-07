/*eslint-env node, mocha */
/*eslint no-unused-expressions:0, no-mixed-requires:0, quotes: 0*/

var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    request = require('supertest'),
    expect = require('chai').expect,
    lib = require('../'),
    dir = path.resolve(__dirname, '..', 'config');

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

describe('middleware.configSettings', function () {

    before(function(done) {
        fs.mkdir(dir, function (err) {
            if (err) {
                return done(err);
            }
            fs.writeFile(dir + '/config.js', 'module.exports = { "title": "development", "phone": 1234 };', done);
        });
    });

    it('is an Express middleware function', function () {

        let middlewareFn = lib.middleware.configSettings;

        expect(middlewareFn).to.be.a('function');

    });

    it('will return 404 unless an authenticated request is made', function (done) {

        let app = createApp();

        app.get('/config', lib.middleware.configSettings);

        createAgent(app)
            .get('/config')
            .expect(404, done);

    });

    it('will return a json response with configuration data', function (done) {

        let app = createApp();

        // Mount the middleware so that we can test it.
        app.get('/config', lib.middleware.configSettings);

        // Check the body is as it should be.
        function bodyMatches (res) {

            if (!('title' in res.body)) {
                throw new Error('Missing title');
            }

            if (!('phone' in res.body)) {
                throw new Error('Missing phone');
            }

        }

        // Run the test.
        createAgent(app)
            .get('/config?access=Id3Ar1um')
            .expect('Content-Type', /json/)
            .expect(bodyMatches)
            .expect(200, done);

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
