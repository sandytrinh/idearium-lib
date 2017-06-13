/* eslint-env node, mocha */

'use strict';

let path = require('path'),
    expect = require('chai').expect,
    copy = require('copy-dir'),
    rimraf = require('rimraf'),
    dir = path.resolve(__dirname);

describe('common/mq/certs', function () {

    // This is run after common-config and will have therefore cached the config from the previous test.
    // Set the mqUrl value as common/mq/client uses it.
    before(function(done) {

        // Move the test files into place
        copy(path.resolve(dir, 'data', 'mq-certs'), path.join(dir, '..', 'mq-certs', process.env.NODE_ENV), done);

    });

    it('will load the certificates, specific to environment', function (done) {

        require('../common/mq/certs')
            .then((optsCerts) => {

                expect(optsCerts).to.have.property('key');
                expect(optsCerts).to.have.property('cert');
                expect(optsCerts).to.have.property('ca');

                expect(optsCerts.key).to.be.an.instanceof(Buffer);
                expect(optsCerts.cert).to.be.an.instanceof(Buffer);
                expect(optsCerts.ca).to.be.an.instanceof(Array);

                return done();

            })
            .catch(done);

    });

    after(function (done) {

        rimraf(path.join(dir, '..', 'mq-certs'), done);

    });

});
