'use strict';

const { expect } = require('chai');
const { hasProperty, hasValue } = require('../lib/util');

describe('util-has', function () {

    it('has property a', function () {
        expect(hasProperty({ a: 1 }, 'a')).to.equal(true);
    });

    it('does not have property b', function () {
        expect(hasProperty({ a: 1 }, 'b')).to.equal(false);
    });

    it('has value 1', function () {
        expect(hasValue({ a: 1 }, 1)).to.equal(true);
    });

    it('does not have value 2', function () {
        expect(hasValue({ a: 1 }, 2)).to.equal(false);
    });

});
