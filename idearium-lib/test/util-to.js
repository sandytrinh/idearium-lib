'use strict';

const { expect } = require('chai');
const {
    toCallback,
    toDecimals,
    toFlatArray,
    toLowercaseKeys,
    toPromise,
} = require('../lib/util');

describe('util-to', function () {

    it('converts to a promise', function () {

        const callbackFunction = (data, callback) => callback(null, data);
        const promiseFunction = toPromise(callbackFunction);

        return promiseFunction('promised!')
            .then(result => expect(result).to.equal('promised!'));

    });

    it('converts to a callback', function () {

        const promiseFunction = data => Promise.resolve(data);
        const callbackFunction = toCallback(promiseFunction);

        callbackFunction('callback', (err, result) => {
            expect(result).to.equal('callback');
        });

    });

    it('converts all keys to lowercase', function () {

        expect(JSON.stringify(toLowercaseKeys({ A: { B: [{ C: [{ D: 1 }] }] } })))
            .to
            .equal(JSON.stringify({ a: { b: [{ c: [{ d: 1 }] }] } }));

    });

    it('reduces all values into an array', function () {

        expect(JSON.stringify(toFlatArray({ a: [{ b: 1 }, { c: 2 }, { d: [3, 4] }] })))
            .to
            .equal(JSON.stringify([1, 2, 3, 4]));

    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.0)).to.equal(10);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.1)).to.equal(10);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.2)).to.equal(10);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.3)).to.equal(10);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.4)).to.equal(10);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.5)).to.equal(11);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.6)).to.equal(11);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.7)).to.equal(11);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.8)).to.equal(11);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(10.9)).to.equal(11);
    });

    it('rounds a floating point number', function () {
        expect(toDecimals(1 / 3, 2)).to.equal(0.33);
    });

});
