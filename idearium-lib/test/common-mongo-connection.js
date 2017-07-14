/* eslint-env node, mocha */

'use strict';

const { expect } = require('chai');
const createDbConnections = require('../common/mongo/connection');

const db1 = {
    options: {
        ssl: false,
        sslValidate: false,
    },
    uri: 'mongodb://mongo:27017/idearium-lib-common-mongo-connection-db1',
};

const db1Ssl = {
    options: {
        ssl: true,
        sslValidate: true,
    },
    uri: 'mongodb://mongo:27017/idearium-lib-common-mongo-connection-db1ssl',
};

const db2 = {
    options: {
        ssl: false,
        sslValidate: false,
    },
    uri: 'mongodb://mongo:27017/idearium-lib-common-mongo-connection-db2',
};

const db2Ssl = {
    options: {
        ssl: true,
        sslValidate: true,
    },
    uri: 'mongodb://mongo:27017/idearium-lib-common-mongo-connection-db2ssl',
};

describe('common/mongo/connection', function () {

    it('should connect to a single database with ssl', function (done) {

        createDbConnections([db1Ssl])
            .then((dbs) => {

                expect(dbs.length).to.equal(1);

                return Promise.all(dbs.map(connection => connection.close()));

            })
            .then(() => done())
            .catch(done);

    });

    it('should connect to a single database without ssl', function (done) {

        createDbConnections([db1])
            .then((dbs) => {

                expect(dbs.length).to.equal(1);

                return Promise.all(dbs.map(connection => connection.close()));

            })
            .then(() => done())
            .catch(done);

    });

    it('should connect to multiple databases with ssl', function (done) {

        createDbConnections([db1Ssl, db2Ssl])
            .then((dbs) => {

                expect(dbs.length).to.equal(2);

                return Promise.all(dbs.map(connection => connection.close()));

            })
            .then(() => done())
            .catch(done);

    });

    it('should connect to multiple databases without ssl', function (done) {

        createDbConnections([db1, db2])
            .then((dbs) => {

                expect(dbs.length).to.equal(2);

                return Promise.all(dbs.map(connection => connection.close()));

            })
            .then(() => done())
            .catch(done);

    });

    it('should connect to multiple databases with a mix of ssls', function (done) {

        createDbConnections([db1Ssl, db2])
            .then((dbs) => {

                expect(dbs.length).to.equal(2);

                return Promise.all(dbs.map(connection => connection.close()));

            })
            .then(() => done())
            .catch(done);

    });

});
