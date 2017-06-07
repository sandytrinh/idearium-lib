'use strict';

const { toFlatArray } = require('./to');

/**
 * Find a value in a given element.
 * @param {Array|Object} obj Element to find a value in.
 * @param {Function} fn Testing function to call.
 * @return {Any} Returns the value of the first element that satisfies the provided testing function or undefined.
 */
const find = (obj, fn) => {

  return toFlatArray(obj)
    .find(fn);

};

module.exports = { find };
