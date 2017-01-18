'use strict';

class Utils {

    /**
     * A method that will parse config as a boolean. Taking a string and evaluating it as `false`.
     * @param  {String}   str        The string version of the boolean to evaluate.
     * @param  {Boolean}  defaultVal The default value to use if str is undefined.
     * @return {Boolean}             The result of the evaluation, either true or false.
     */
    static parseConfigAsBoolean (val, defaultVal) {

        if (defaultVal === undefined) {
            throw new Error('Default value is required.');
        }

        return val === undefined ? defaultVal : (val === 'false' ? false : true);

    }

}

module.exports = Utils;
