'use strict';

const { Duplex } = require('stream');
const { Readable } = require('stream');
const parse = require('csv-parse');
const transformStream = require('stream-transform');
const streamToPromise = require('stream-to-promise');

/**
 * A method that will parse config as a boolean. Taking a string and evaluating it as `false`.
 * @param {String} str The string version of the boolean to evaluate.
 * @param {Boolean} defaultVal The default value to use if str is undefined.
 * @return {Boolean} The result of the evaluation, either true or false.
 */
const parseConfigAsBoolean = (val, defaultVal) => {

    if (defaultVal === undefined) {
        throw new Error('Default value is required.');
    }

    return val === undefined ? defaultVal : (val === 'false' ? false : true);

};

/**
 * Parse a csv file.
 * @example
 * parseCsv(BufferData)
 *     .then(data => console.log(data))
 *     .catch(console.error);
 * @param {Buffer|Stream} data Readable stream or buffered data contents.
 * @param {Object} options Csv-parse options. http://csv.adaltas.com/parse/
 * @param {Object} options.transform Optional transform function.
 * @return {Promise} The parsed array contents.
 */
const parseCsv = (data, options) => new Promise((resolve, reject) => {

    let stream = data;

    // Allow the caller to pass a Buffer.
    if (!(stream instanceof Readable)) {

        stream = new Duplex();

        stream.push(data);
        stream.push(null);

    }

    const csv = [];
    const settings = Object.assign({ transform: (row, cb) => cb(null, row) }, options);

    // Calls the transform function and pushes the results to the csv array.
    const transformer = row => settings.transform(row, (err, result) => {

        if (err) {
            return reject(err);
        }

        return csv.push(result);

    });

    const outputStream = stream.pipe(parse())
        .pipe(transformStream(transformer));

    streamToPromise(outputStream)
            .then(() => resolve(csv))
            .catch(reject);

});

module.exports = { parseConfigAsBoolean, parseCsv };
