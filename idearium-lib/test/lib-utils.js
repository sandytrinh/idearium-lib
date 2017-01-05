/*eslint-env node, mocha */
/*eslint no-unused-expressions:0, no-mixed-requires:0, quotes: 0*/

var expect = require('chai').expect,
    lib = require('../');

describe('utils', function () {

    describe('parseConfigAsBoolean()', function () {

        it('should error if default value is not provided', function () {

            expect(function () {
                lib.utils.parseConfigAsBoolean();
            }).to.throw(Error);

        });

        it('should return default value if provided value is undefined', function () {

            var result1 = lib.utils.parseConfigAsBoolean(undefined, true),
                result2 = lib.utils.parseConfigAsBoolean(undefined, false);

            expect(result1).to.be.true;
            expect(result2).to.be.false;

        });

        it('should return true if provided value is a String of "true"', function () {

            var result1 = lib.utils.parseConfigAsBoolean('true', true);

            expect(result1).to.be.true;

        });


        it('should return true if provided value is a String of "false"', function () {

            var result1 = lib.utils.parseConfigAsBoolean('false', true);

            expect(result1).to.be.false;

        });

    });

});
