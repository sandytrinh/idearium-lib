'use strict';

const log = require('./log')('idearium-lib:common:kue');
const queue = require('./queue');

/**
 * Verify and create a factory method for creating kue jobs.
 * @param {String} type The job type.
 * @param {String} properties Object properties to verify.
 * @return {Promise} Creates the job.
 */
const constructCreateMethod = (type, properties) => {

    if (!type) {
        throw new Error('Type is missing');
    }

    if (!properties) {
        throw new Error('Properties is missing');
    }

    return (title, options) => new Promise((resolve, reject) => {

        if (!properties.every(prop => Object.keys(options).includes(prop))) {
            return reject(new Error('Options is missing some required properties'));
        }

        const settings = {
            attempts: 5,
            backoff: {
                delay: 3 * 60 * 1000,
                type: 'fixed',
            },
            title,
        };

        Object.assign(settings, options);

        const job = queue.create(type, settings);

        job.attempts(settings.attempts)
            .backoff(settings.backoff)
            .save((err) => {

                if (err) {

                    queue.emit('job failed', settings);

                    return reject(new Error(`Failed to create job: ${title} of type ${type}`));

                }

                queue.emit('job enqueued', settings);

                return resolve(settings);

            });

    });

};

/**
 * Helper function to process Kue jobs.
 * @param {String} type Job type to process.
 * @param {Function} fn Queue process callback.
 * @return {Void} Processes the job.
 */
const process = (type, fn) => queue.process(type, (job, done) => {

    log.debug({ job, type }, `Processing job with type ${type}`);

    fn(job)
        .then(data => done(null, data))
        .catch(done);

});

module.exports = { constructCreateMethod, process };
