'use strict';

class Utils {

    static parseConfigAsBoolean(val, defaultVal) {

        if (defaultVal === undefined) {
            throw new Error('Default value is required.');
        }

        return val === undefined ? defaultVal : (val === 'false' ? false : true);

    }

}

module.exports = Utils;
