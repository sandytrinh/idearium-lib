'use strict';

const { isArray, isObject } = require('./is');

/**
 * Convert a promise into a node style callback.
 * @this func
 * @param {Function} func Function to turn into a node style callback.
 * @return {Promise} Promise as a node style callback.
 */
const toCallback = function toCallback(func) {

    const startIndex = 0;
    const endIndex = 1;

    return (...args) => {

        const callback = args[args.length - endIndex];
        const onlyArgs = args.slice(startIndex, args.length - endIndex);

        func.apply(this, onlyArgs)
            .then(data => callback(null, data))
            .catch(err => callback(err));

    };

};

const zero = 0;

/**
 * Round a number to the specified significant digits.
 * @param {Number} value Value to round.
 * @param {Number} [decimals=zero] Decimals to round to.
 * @return {Number} Returns the rounded number.
 */
const toDecimals = (value, decimals = zero) => {
    return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
};

/**
 * Flatten an array.
 * @param {Array|Object} obj Array or Object to convert.
 * @return {Array} The converted Array or Object.
 */
const toFlatArray = (obj) => {

    const keys = Object.keys(obj);

    return [].concat(keys.reduce((element, index) => {

        const value = obj[index];
        const newValue = (isArray(value) || isObject(value)) ? toFlatArray(value) : value;

        return element.concat(newValue);

    }, []));

};

/**
 * Convert object keys to lowercase.
 * @param {Object} obj An object.
 * @return {Object} Returns an object with lowercase keys.
 */
const toLowercaseKeys = (obj) => {

    const keys = Object.keys(obj);

    return keys.reduce((element, index) => {

        const value = obj[index];
        const newValue = (isArray(value) || isObject(value)) ? toLowercaseKeys(value) : value;
        const lowercaseKey = (typeof index === 'string') ? index.toString()
            .toLowerCase() : index;

        element[lowercaseKey] = newValue;

        return element;

    }, isObject(obj) ? {} : []);

};

/**
 * Convert a node style callback into a promise.
 * @this func
 * @param {Function} func Function to turn into a promise.
 * @return {Promise} Callback as a promise.
 */
const toPromise = function toPromise(func) {

    return (...args) => new Promise((resolve, reject) => {

        const callback = (err, result) => {

            if (err) {
                return reject(err);
            }

            return resolve(result);

        };

        func.apply(this, [...args, callback]);

    });

};

module.exports = { toCallback, toDecimals, toFlatArray, toLowercaseKeys, toPromise };
