'use strict';

const { expect } = require('chai');
const {
    isArray,
    isDevelopment,
    isProduction,
    isEqual,
    isObject,
} = require('../lib/util');

describe('util-is', function () {

    it('is an array', function () {
        expect(isArray([])).to.equal(true);
    });

    it('is development environment', function () {
        expect(isDevelopment('DeVeLoPmEnT')).to.equal(true);
    });

    it('is production environment', function () {
        expect(isProduction('PrOdUcTiOn')).to.equal(true);
    });

    it('should be equal', function () {
        expect(isEqual('string', 'string')).to.equal(true);
    });

    it('should not be equal', function () {
        expect(isEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).to.equal(false);
    });

    it('should not be equal', function () {
        expect(isEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 })).to.equal(false);
    });

    it('should be equal', function () {
        expect(isEqual(0, 0)).to.equal(true);
    });

    it('should not be equal', function () {
        expect(isEqual(0, -0)).to.equal(false);
    });

    it('should be equal', function () {
        expect(isEqual()).to.equal(true);
    });

    it('should be equal', function () {
        expect(isEqual(null, null)).to.equal(true);
    });

    it('should be equal', function () {
        expect(isEqual(NaN, NaN)).to.equal(true);
    });

    it('should be an object', function () {
        expect(isObject({})).to.equal(true);
    });

    it('should not be an object', function () {
        expect(isObject('string')).to.equal(false);
    });

    it('should not be an object', function () {
        expect(isObject([])).to.equal(false);
    });

    it('should not be an object', function () {
        expect(isObject()).to.equal(false);
    });

    it('should not be an object', function () {
        expect(isObject(null)).to.equal(false);
    });

});
