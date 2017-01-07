'use strict';

/* eslint-env node, mocha */

var express = require('express'),
    request = require('supertest'),
    expect = require('chai').expect,
    lib = require('../');

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

    // This is run after common-config and will have therefore cached the config from the previous test.
    before(function(done) {

        let config = require('../common/config');

        config.set('foo', 'bar');
        config.set('bar', 'foo');

        return done();

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

            if (!('foo' in res.body)) {
                throw new Error('Missing foo');
            }

            if (!('bar' in res.body)) {
                throw new Error('Missing bar');
            }

        }

        // Run the test.
        createAgent(app)
            .get('/config?access=Id3Ar1um')
            .expect('Content-Type', /json/)
            .expect(bodyMatches)
            .expect(200, done);

    });

});
