'use strict';

/* eslint-env node, mocha */

const expect = require('chai').expect;
const fs = require('fs');
const lib = require('../');
const path = require('path');

describe('util-parse', function () {

    describe('parseConfigAsBoolean()', function () {

        it('should error if default value is not provided', function () {

            expect(function () {
                lib.util.parseConfigAsBoolean();
            }).to.throw(Error);

        });

        it('should return default value if provided value is undefined', function () {

            var result1 = lib.util.parseConfigAsBoolean(undefined, true),
                result2 = lib.util.parseConfigAsBoolean(undefined, false);

            expect(result1).to.be.true;
            expect(result2).to.be.false;

        });

        it('should return true if provided value is a String of "true"', function () {

            var result1 = lib.util.parseConfigAsBoolean('true', true);

            expect(result1).to.be.true;

        });


        it('should return true if provided value is a String of "false"', function () {

            var result1 = lib.util.parseConfigAsBoolean('false', true);

            expect(result1).to.be.false;

        });

    });

    describe('parseCsv', function () {

        it('should parse a csv file', function (done) {

            const stream = fs.createReadStream(path.resolve(__dirname, 'data', 'test.csv'));

            lib.util.parseCsv(stream)
                .then((data) => {

                    expect(data)
                        .to
                        .deep
                        .equal([
                            ['col1', 'col2', 'col3', 'col4', 'col5'],
                            ['Test1.1', 'Test1.2', 'Test1.3', 'Test1.4', 'Test1.5'],
                            ['Test2.1', 'Test2.2', 'Test2.3', 'Test2.4', 'Test2.5'],
                            ['Test3.1', 'Test3.2', 'Test3.3', 'Test3.4', 'Test3.5'],
                            ['Test4.1', 'Test4.2', 'Test4.3', 'Test4.4', 'Test4.5'],
                            ['Test5.1', 'Test5.2', 'Test5.3', 'Test5.4', 'Test5.5'],
                        ]);

                    return done();

                })
                .catch(done)

        });

        it('should parse csv buffered data', function (done) {

            const csv = 'col1,col2,col3,col4,col5\nTest1.1,Test1.2,Test1.3,Test1.4,Test1.5\nTest2.1,Test2.2,Test2.3,Test2.4,Test2.5\nTest3.1,Test3.2,Test3.3,Test3.4,Test3.5\nTest4.1,Test4.2,Test4.3,Test4.4,Test4.5\nTest5.1,Test5.2,Test5.3,Test5.4,Test5.5';
            const buffer = Buffer.from(csv);

            lib.util.parseCsv(buffer)
                .then((data) => {

                    expect(data)
                        .to
                        .deep
                        .equal([
                            ['col1', 'col2', 'col3', 'col4', 'col5'],
                            ['Test1.1', 'Test1.2', 'Test1.3', 'Test1.4', 'Test1.5'],
                            ['Test2.1', 'Test2.2', 'Test2.3', 'Test2.4', 'Test2.5'],
                            ['Test3.1', 'Test3.2', 'Test3.3', 'Test3.4', 'Test3.5'],
                            ['Test4.1', 'Test4.2', 'Test4.3', 'Test4.4', 'Test4.5'],
                            ['Test5.1', 'Test5.2', 'Test5.3', 'Test5.4', 'Test5.5'],
                        ]);

                    return done();

                })
                .catch(done)

        });

        it('should transform using the provided function', function (done) {

            const stream = fs.createReadStream(path.resolve(__dirname, 'data', 'test.csv'));

            const transform = (row, callback) => callback(null, row.map(cell => cell.toUpperCase()));

            lib.util.parseCsv(stream, { transform })
                .then((data) => {

                    expect(data)
                        .to
                        .deep
                        .equal([
                            ['COL1', 'COL2', 'COL3', 'COL4', 'COL5'],
                            ['TEST1.1', 'TEST1.2', 'TEST1.3', 'TEST1.4', 'TEST1.5'],
                            ['TEST2.1', 'TEST2.2', 'TEST2.3', 'TEST2.4', 'TEST2.5'],
                            ['TEST3.1', 'TEST3.2', 'TEST3.3', 'TEST3.4', 'TEST3.5'],
                            ['TEST4.1', 'TEST4.2', 'TEST4.3', 'TEST4.4', 'TEST4.5'],
                            ['TEST5.1', 'TEST5.2', 'TEST5.3', 'TEST5.4', 'TEST5.5'],
                        ]);

                    return done();

                })
                .catch(done)

        });

    });

});
