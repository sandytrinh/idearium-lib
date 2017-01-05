'use strict';

var fs = require('fs'),
    path = require('path');

//
// Private methods
//

/**
 * Takes a directory and a filename, and returns an object with the transformed name and contents of the file.
 * @param  {String} dir  A directory containing a file.
 * @param  {String} file The name of the file within the directory.
 * @return {object}      An object with keys `name` and `content`.
 */
function processFile (dir, file) {

    // Grab just the name.
    var name = basename(file);

    // Try for camelCase first.
    if (this.camelCase) {
        name = toCamelCase(name);
    }

    // Try for ClassCase second.
    if (this.classCase) {
        name = toClassCase(name);
    }

    // Return the transformed name, and the content.
    return {
        name: name,
        content: require(path.join(path.resolve(dir), '/', file))
    }

}

/**
 * Takes an array of file names and filters out `index.js`.
 * @param  {array} files An of file names.
 * @return {array}       The filtered array.
 */
function filterNames (files) {

    return files.filter((file) => basename(file) !== 'index');

}

/**
 * A short-cut for path.basename
 * @param  {String} file The name of the file.
 * @return {String}      The file name sans the extension (i.e. index.js becomes index).
 */
function basename (file) {

    return path.basename(file, '.js');

}

/**
 * Take a string, replace `-` and convert to camel case (i.e. camel-case becomes camelCase).
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function toCamelCase (name) {

    return name.replace(/-([a-z])/g, function (str) {
        return str.replace('-', '').toUpperCase();
    });

}

/**
 * Take a string, replace `-` and convert to class case (i.e. camel-case becomes CamelCase).
 * @param  {String} name The string to replace.
 * @return {String}      The updated string.
 */
function toClassCase (name) {

    return name[0].toUpperCase() + name.replace(/^[a-z](.*)/, '$1');

}

/**
 * Asynchronously loads a directory of files.
 * @param  {String} dir       The directory containing the files.
 * @param  {function} resolve A function to execute with the results.
 * @param  {function} reject  A function to execute wiht the errors.
 * @return {void}
 */
function loadAsync (dir, resolve, reject) {

    // Async read the files in the directory.
    fs.readdir(dir, (err, files) => {

        // Handle err.
        if (err) {
            return reject(err);
        }

        // Handle when there were no files to load.
        if (!files) {
            return resolve({});
        }

        let loaded = {};

        // Ignore index.js files.
        files = filterNames.call(this, files);

        // Fill the object with required content.
        files.forEach((file) => {

            let {name, content} = processFile.call(this, dir, file);

            // Load the actual file.
            loaded[name] = content;

        });

        // Once we're done, resolve the promise.
        return resolve(loaded);

    });

}

/**
 * Synchronously loads a directory of files.
 * @param  {String} dir The directory containing files.
 * @return {Object}     An object containing keys (the transformed names of the files) and contents of the files.
 */
function loadSync (dir) {

    // Async read the files in the directory.
    let files = fs.readdirSync(dir),
        loaded = {};

    // Handle when there were no files to load.
    if (!files) {
        return loaded;
    }

    // Ignore index.js files.
    files = filterNames.call(this, files);

    // Fill the object with required content.
    files.forEach((file) => {

        let {name, content} = processFile.call(this, dir, file);

        // Load the actual file.
        loaded[name] = content;

    });

    // Once we're done, resolve the promise.
    return loaded;

}

class Loader {

    constructor () {

        this.camelCase = true;
        this.classCase = false;
        this.sync = false;

        return this;

    }

    //
    // Public methods
    //

    /**
     * Load (`require`) each file within a directory and return an Object referencing the content.
     * @param  {String} dir        A path of files to load.
     * @return {Object|Promise}    Either an object, or a promise which will be resolved with an object.
     */
    load (dir) {

        if (!dir) {
            throw new Error('You must supply the dir parameter');
        }

        // Should we do this synchronously?
        if (this.sync) {
            return loadSync.call(this, dir);
        }

        // Return a promise, so that we can use async all the way.
        return new Promise((resolve, reject) => {
            return loadAsync.call(this, dir, resolve, reject);
        });

    }

}

module.exports = Loader;
