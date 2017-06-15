'use strict';

const kueQueue = require('./kue-queue');

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

    // Always add routingKey as a required property.
    if (type === 'webhook' && !properties.includes('routingKey')) {
        properties.push('routingKey');
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

module.exports = { constructCreateMethod };
