'use strict';

const bcrypt = require('bcryptjs')

class Hash {

    /**
     * Constructor
     * @param  {String} identifier The identifier to hash
     * @return {Object}            Hash instance
     */
    constructor (identifier) {

        if (!identifier) {
            throw new Error('You must supply an identifier string.');
        }

        this.identifier = identifier;
        this.hashed = undefined;

        return this;

    }

    /**
     * A method used to one-way-hash a string
     * @param  {Function} callback The callback that will return the string
     * @return {void}
     */
    hash (callback) {

        if (!callback) {
            throw new Error('You must supply a callback function.');
        }

        // Generate a salt.
        bcrypt.genSalt(10, (err, salt) => {

            if (err) {
                return callback(err);
            }

            // Generate a hash.
            bcrypt.hash(this.identifier, salt, (hashErr, hash) => {

                if (hashErr) {
                    return callback(hashErr);
                }

                this.hashed = hash;

                return callback(null, this.hashed);

            });

        });

    }

    /**
     * Compare a hash with the identifer.
     */
    compare (hash, callback) {

        if (!callback) {
            throw new Error('You must supply a callback function.');
        }

        if (!hash) {
            throw new Error('You must supply a hash to compare with.');
        }

        // Run the comparison and return the result.
        bcrypt.compare(this.identifier, hash, callback);

    }

}

module.exports = Hash;
