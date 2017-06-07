'use strict';

/* eslint-env node, mocha */

var expect = require('chai').expect;

describe('common/exception', function () {

    const debug = require('debug');

    // eslint-disable-next-line no-console
    let ce = console.error;
    let pe = process.exit;
    let dl = debug.log;

    beforeEach(function () {

        // eslint-disable-next-line no-console
        console.error = () => {};
        process.exit = () => {};
        debug.log = () => {};

    });

    afterEach(function () {

        // eslint-disable-next-line no-console
        console.error = ce;
        process.exit = pe;
        debug.log = dl;

    });

    it('is a function', function () {
        expect(require('../common/exception')).to.be.a('function');
    });

    it('will log to console.error', function (done) {

        // eslint-disable-next-line no-console
        console.error = function (err) {

            expect(err.message).to.match(/A console error exception/);
            done();

        }

        require('../common/exception')(new Error('A console error exception'));

    });

    it('will log via debug', function (done) {

        // No-op function (disable output).
        debug.log = function (msg) {

            expect(msg).to.match(/Exception logged/);
            done();

        };

        require('../common/exception')(new Error('A debug error exception'));

    });

});
