'use strict';

const mongoose = require('mongoose');
const { expect } = require('chai');
const { find, findOne } = require('../lib/query');

describe('query', function () {

    const userModel = mongoose.model('userModel', new mongoose.Schema({
        email: String,
        username: String,
    }));

    it('will return a query object', function () {

        const queryObject = find(userModel, {
            filter: { _id: '5938a0aefb6e41e0e8368d00' },
            lean: false,
            limit: 20,
            projection: 'email username',
        });

        const { _conditions, _fields, _mongooseOptions, options } = queryObject;

        expect(_conditions._id.toString()).to.equal('5938a0aefb6e41e0e8368d00');
        expect(_mongooseOptions.lean).to.equal(false);
        expect(_fields).to.have.all.keys('email', 'username');
        expect(options.limit).to.equal(20);

    });

    it('will return a query object', function () {

        const queryObject = find(userModel, {
            filter: { _id: '5938a0aefb6e41e0e8368d00' },
            lean: false,
            projection: 'email username',
        });

        const { _conditions, _fields, _mongooseOptions, options } = queryObject;

        expect(_conditions._id.toString()).to.equal('5938a0aefb6e41e0e8368d00');
        expect(_mongooseOptions.lean).to.equal(false);
        expect(_fields).to.have.all.keys('email', 'username');
        expect(options.limit).to.equal(10);

    });

    it('will return a query object', function () {

        const queryObject = find(userModel, {
            filter: { _id: '5938a0aefb6e41e0e8368d00' },
            projection: 'email username',
        });

        const { _conditions, _fields, _mongooseOptions, options } = queryObject;

        expect(_conditions._id.toString()).to.equal('5938a0aefb6e41e0e8368d00');
        expect(_mongooseOptions.lean).to.equal(true);
        expect(_fields).to.have.all.keys('email', 'username');
        expect(options.limit).to.equal(10);

    });

    it('will return a query object', function () {

        const queryObject = find(userModel, {
            filter: { _id: '5938a0aefb6e41e0e8368d00' },
        });

        const { _conditions, _fields, _mongooseOptions, options } = queryObject;

        expect(_conditions._id.toString()).to.equal('5938a0aefb6e41e0e8368d00');
        expect(_mongooseOptions.lean).to.equal(true);
        expect(_fields).to.be.undefined;
        expect(options.limit).to.equal(10);

    });

    it('will return a query object', function () {

        const queryObject = findOne(userModel, {
            filter: { _id: '5938a0aefb6e41e0e8368d00' },
            lean: false,
            projection: 'email username',
        });

        const { _conditions, _fields, _mongooseOptions } = queryObject;

        expect(_conditions._id.toString()).to.equal('5938a0aefb6e41e0e8368d00');
        expect(_mongooseOptions.lean).to.equal(false);
        expect(_fields).to.have.all.keys('email', 'username');

    });

    it('will return a query object', function () {

        const queryObject = findOne(userModel, {
            filter: { _id: '5938a0aefb6e41e0e8368d00' },
            projection: 'email username',
        });

        const { _conditions, _fields, _mongooseOptions } = queryObject;

        expect(_conditions._id.toString()).to.equal('5938a0aefb6e41e0e8368d00');
        expect(_mongooseOptions.lean).to.equal(true);
        expect(_fields).to.have.all.keys('email', 'username');

    });

    it('will return a query object', function () {

        const queryObject = findOne(userModel, {
            filter: { _id: '5938a0aefb6e41e0e8368d00' },
        });

        const { _conditions, _fields, _mongooseOptions } = queryObject;

        expect(_conditions._id.toString()).to.equal('5938a0aefb6e41e0e8368d00');
        expect(_mongooseOptions.lean).to.equal(true);
        expect(_fields).to.be.undefined;

    });

});
