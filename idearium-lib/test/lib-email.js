/* eslint-env node, mocha */

'use strict';

var expect = require('chai').expect,
    lib = require('../'),
    mandrillApiKey = '1234';

describe('class Email', function () {

    describe('create an instance', function () {

        it('should fail, if the apiKey parameter is not provided', function () {

            expect(function () {
                return new lib.Email();
            }).to.throw(Error, /apiKey/);

        });

        it('should fail, if the service class is not provided', function () {

            expect(function () {
                return new lib.Email(mandrillApiKey);
            }).to.throw(Error, /service/i);

            expect(function () {
                return new lib.Email(mandrillApiKey, 'Mandrill');
            }).to.throw(Error, /service/i);

        });

        it('should work, if everything has been provided correctly', function () {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(email).to.exist;
            expect(email.service).to.exist;
            expect(email.service instanceof lib.emailServices.Mandrill).to.be.true;

        });

        it('should work, when provided an instance of the Mandrill class', function () {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(email).to.exist;
            expect(email.service).to.exist;
            expect(email.service instanceof lib.emailServices.Mandrill).to.be.true;

        });

    });

    describe('send email', function () {

        it('should fail, if "html" and "text" is not provided', function (done) {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(function (){
                email.send({}, function () {});
            }).to.throw(Error, '"message.html" and "message.text" is missing, one of these fields is required.');

            return done();

        });

        it('should fail, if "fromEmail" is not provided', function (done) {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(function (){
                email.send({ html: '<p>hello</p>'}, function () {});
            }).to.throw(Error, '"message.fromEmail" field is either missing or is empty.');

            return done();

        });

        it('should fail, if "to" is not provided', function (done) {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(function (){
                email.send({
                    'html': '<p>hello</p>',
                    'fromEmail': 'from@test.com'
                }, function () {});
            }).to.throw(Error, '"message.to" field is either missing or is empty.');

            return done();

        });

        it('should fail, if "to" is not of type String or Array', function (done) {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(function (){
                email.send({
                    'html': '<p>hello</p>',
                    'fromEmail': 'from@test.com',
                    'to': {}
                }, function () {});
            }).to.throw(Error, '"message.to" must be of type String or Array.');

            return done();

        });

        it('should fail, if "to" (String) has an invalid email', function (done) {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(function (){
                email.send({
                    'html': '<p>hello</p>',
                    'fromEmail': 'from@test.com',
                    'to': 'test@test'
                }, function () {});
            }).to.throw(Error, 'test@test is not a valid email address.');

            return done();

        });

        it('should fail, if "to" is an empty Array', function (done) {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(function (){
                email.send({
                    'html': '<p>hello</p>',
                    'fromEmail': 'from@test.com',
                    'to': []
                }, function () {});
            }).to.throw(Error, '"message.to" Array field is empty.');

            return done();

        });

        it('should fail, if "to" Array has a missing email field', function (done) {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(function (){
                email.send({
                    'html': '<p>hello</p>',
                    'fromEmail': 'from@test.com',
                    'to': [{ name: 'test' }]
                }, function () {});
            }).to.throw(Error, 'Missing "email" field in one of the "message.to" Array.');

            return done();

        });

        it('should fail, if "to" Array has an invalid email', function (done) {

            let email = new lib.Email(mandrillApiKey, lib.emailServices.Mandrill);

            expect(function (){
                email.send({
                    'html': '<p>hello</p>',
                    'fromEmail': 'from@test.com',
                    'to': [{
                        'name': 'test',
                        'email': 'test@test'
                    }]
                }, function () {});
            }).to.throw(Error, 'test@test is not a valid email address.');

            return done();

        });

    });

});
