/*eslint-env node, mocha */
/*eslint no-unused-expressions:0, no-mixed-requires:0, quotes: 0*/

var expect = require('chai').expect,
    path = require('path'),
    fs = require('fs'),
    dir = path.resolve(__dirname, '..', 'lib-mq-manager'),
    mq = require('..').mq;

describe('class mq.Manager', function () {

    describe('will throw an Error', function () {

        it('if a path is not provided', function () {

            var fn = function () {
                var ideariumMq = new mq.Manager();
            };

            expect(fn).to.throw(Error, /path parameter is required/);

        });

    });

    describe('with the messages directory', function () {

        before(function (done) {

            fs.mkdir(dir, function () {

                fs.writeFile(path.join(dir, 'test.js'), 'module.exports = { "consume": "" };', done);

            });

        });


        it('will load messages and fire an event', function (done) {

            var mqManager = new mq.Manager(dir);

            mqManager.addListener('load', function () {
                expect(mqManager.messages).to.have.keys('test');
                return done();
            });

        });

        it('will execute consumers', function (done) {

            var mqManager = new mq.Manager(dir);

            require(path.join(dir, 'test.js')).consume = function () {
                return done();
            };

            mqManager.addListener('load', function () {
                mqManager.registerConsumers();
            });

        });

        it('will publish a message', function (done) {

            var mqManager = new mq.Manager(dir);

            require(path.join(dir, 'test.js')).publish = function (data) {

                expect(data).to.eql({'will-publish-a-message': true});
                return done();

            };

            mqManager.addListener('load', function () {
                mqManager.publish('test', {'will-publish-a-message': true});
            });

        });

        after(function (done) {
            fs.unlink(path.join(dir, 'test.js'), function () {
                fs.rmdir(dir, done);
            });
        });

    });

});
