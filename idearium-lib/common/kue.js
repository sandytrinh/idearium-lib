'use strict';

const log = require('./log')('idearium-lib:common:kue');
const kueQueue = require('./kue-queue');
const path = require('path');
const { Loader } = require('../');

// Setup the loader.
const loader = new Loader();
loader.camelCase = false;

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

        const job = kueQueue.create(type, settings);

        job.attempts(settings.attempts)
            .backoff(settings.backoff)
            .save((err) => {

                if (err) {

                    kueQueue.emit('job failed', settings);

                    return reject(new Error(`Failed to create job: ${title} of type ${type}`));

                }

                kueQueue.emit('job enqueued', settings);

                return resolve(settings);

            });

    });

};

/**
 * Load jobs from the jobs directory.
 * @return {Promise} Resolves with the jobs.
 */
const loadJobs = () => loader.load(path.join(process.cwd(), 'jobs'));

/**
 * Process all jobs in the jobs directory.
 * @return {Void} Processes the jobs.
 */
const processJobs = () => new Promise((resolve, reject) => {

    loadJobs()
        .then((jobs) => {

            const jobKeys = Object.keys(jobs);

            // An array of job process functions.
            const jobProcesses = jobKeys.map((type) => new Promise((resolve, reject) => {

                kueQueue.process(type, (job, done) => {

                    log.debug({ job, type }, `Processing job with type ${type}`);

                    const fn = jobs[type];

                    log.debug({ fn }, 'Calling function');

                    fn(job)
                        .then(data => resolve(done(null, data)))
                        .catch(err => reject(done(err)));

                });

            }));

            // Process the jobs.
            return Promise.all(jobProcesses);

        })
        .then(resolve)
        .catch(reject);

});

module.exports = { constructCreateMethod, processJobs };
