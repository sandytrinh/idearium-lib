'use strict';

/**
 * Assign some defaults to the passed Mongoose query options.
 * @example
 * // returns {
 *     filter: { _id: id },
 *     lean: true,
 *     limit: 10,
 *     projection: '',
 * }
 * getOptions({ filter: { _id: id });
 * @param {Object} options Mongoose query options.
 * @param {Object} options.filter Mongo query filters.
 * @param {Boolean} options.lean Whether to return a plain JavaScript object or not.
 * @param {Number} options.limit Number of documents to return.
 * @param {String} options.projection Space delimited string containing the fields to return.
 * @return {Object} Returns the options object for Mongoose queries.
 */
const getOptions = (options) => {

    const defaults = {
        filter: {},
        lean: true,
        limit: 10,
        projection: '',
    };

    Object.assign(defaults, options);

    // We want to return all fields.
    if (options.projection === false) {
        delete defaults.projection;
    }

    return defaults;

};

/**
 * Find documents from a model.
 * @example
 * query.find(UserModel, {
 *     filter: { _id: id },
 *     lean: false, // Defaults to true
 *     limit: 5, // Defaults to 10
 *     projection: 'email username', // _id is always returned
 * });
 * @param {Object} model Mongoose model.
 * @param {Object} options Mongoose query options.
 * @param {Object} options.filter Mongo query filters.
 * @param {Boolean} options.lean Whether to return a plain JavaScript object or not.
 * @param {Number} options.limit Number of documents to return.
 * @param {String} options.projection Space delimited string containing the fields to return.
 * @return {Promise} Returns a Mongoose query.
 */
const find = (model, options) => {

    const { filter, lean, limit, projection } = getOptions(options);

    return model.find(filter, projection)
        .lean(lean)
        .limit(limit)
        .exec();

};

/**
 * Find one document from a model.
 * @example
 * query.findOne(UserModel, {
 *     filter: { _id: id },
 *     lean: false, // Defaults to true
 *     projection: 'email username', // _id is always returned
 * });
 * @param {Object} model Mongoose model.
 * @param {Object} options Mongoose query options.
 * @param {Object} options.filter Mongo query filters.
 * @param {Boolean} options.lean Whether to return a plain JavaScript object or not.
 * @param {String} options.projection Space delimited string containing the fields to return.
 * @return {Promise} Returns a Mongoose query.
 */
const findOne = (model, options) => {

    const { filter, lean, projection } = getOptions(options);

    return model.findOne(filter, projection)
        .lean(lean)
        .exec();

};

module.exports = { find, findOne };
