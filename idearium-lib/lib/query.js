'use strict';

/**
 * Assign some defaults to the passed Mongoose query options.
 * @param {Object} options Mongoose query options.
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
 * @param {Object} model Mongoose model.
 * @param {Object} options Mongoose query options.
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
 * @param {Object} model Mongoose model.
 * @param {Object} options Mongoose query options.
 * @return {Promise} Returns a Mongoose query.
 */
const findOne = (model, options) => {

    const { filter, lean, limit, projection } = getOptions(options);

    return model.findOne(filter, projection)
        .lean(lean)
        .limit(limit)
        .exec();

};

module.exports = { find, findOne };
