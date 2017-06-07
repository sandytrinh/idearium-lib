'use strict';

/**
 * Test if the object is an array.
 * @param {Array} arr Array to test.
 * @return {Boolean} True if the object is an array.
 */
const isArray = arr => Array.isArray(arr);

/**
 * Determine if the environment is beta.
 * @param {String} str String to compare.
 * @return {Boolean} True if the environment is beta.
 */
const isBeta = str => str.toLowerCase() === 'beta';

/**
 * Determine if the environment is development.
 * @param {String} str String to compare.
 * @return {Boolean} True if the environment is development.
 */
const isDevelopment = str => str.toLowerCase() === 'development';

/**
 * Check if 2 values are equal.
 * @param {Any} value1 First value.
 * @param {Any} value2 Second value.
 * @return {Boolean} True if the two values are equal.
 */
const isEqual = (value1, value2) => Object.is(value1, value2);

/**
 * Test if an object is really an object.
 * @param {Object} obj An object.
 * @return {Boolean} True if the object is really an object.
 */
const isObject = obj => !isEqual(obj, null) && !isArray(obj) && obj === Object(obj);

/**
 * Determine if the environment is production.
 * @param {String} str String to compare.
 * @return {Boolean} True if the environment is production.
 */
const isProduction = str => str.toLowerCase() === 'production';

/**
 * Determine if the environment is staging.
 * @param {String} str String to compare.
 * @return {Boolean} True if the environment is staging.
 */
const isStaging = str => str.toLowerCase() === 'staging';

module.exports = {
    isArray,
    isBeta,
    isDevelopment,
    isEqual,
    isObject,
    isProduction,
    isStaging,
};
