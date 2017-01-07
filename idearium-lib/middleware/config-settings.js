'use strict';

/**
 * An Express middleware function that will expose the configuration of an application if it passes the test.
 * @param  {Object} req HTTP request object.
 * @param  {Object} res HTTP response object
 * @return {void}
 */
module.exports = function (req, res) {

    // Provide some limited amount of protection.
    if (!req.query || !req.query.access || req.query.access !== 'Id3Ar1um') {
        return res.status(404).send();
    }

    // Output the current configuration as a JSON response.
    return res.json(require('../common/config').getAll());

};
