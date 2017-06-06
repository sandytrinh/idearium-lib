'use strict';

const { expect } = require('chai');
const { find } = require('../lib/util');

describe('util-find', function () {

    it('will find value 1', function () {
        expect(find([1], element => element === 1)).to.equal(1);
    });

    it('will find value 2', function () {
        expect(find({ a: { b: [2] } }, element => element === 2)).to.equal(2);
    });

});
