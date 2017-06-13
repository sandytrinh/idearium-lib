/* eslint-env node, mocha */

'use strict';

let path = require('path'),
    expect = require('chai').expect,
    copy = require('copy-dir'),
    rimraf = require('rimraf'),
    dir = path.resolve(__dirname);

describe('common/mongo/certs', function () {

    // This is run after common-config and will have therefore cached the config from the previous test.
    // Set the mqUrl value as common/mq/client uses it.
    before(function(done) {

        // Move the test files into place
        copy(path.resolve(dir, 'data', 'mongo-certs'), path.join(dir, '..', 'mongo-certs', process.env.NODE_ENV), done);

    });

    it('will load the certificates, specific to environment', function (done) {

        require('../common/mongo/certs')
            .then((certs) => {

                expect(certs).to.be.an.instanceof(Array);
                expect(certs).to.have.lengthOf(2);

                return done();

            })
            .catch(done);

    });

    after(function (done) {

        rimraf(path.join(dir, '..', 'mongo-certs'), done);

    });

});
