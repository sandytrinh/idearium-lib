'use strict';

const config = require('./config');
const opbeat = require('opbeat');
const { isDevelopment } = require('../lib/util');

// Determine if Opbeat should be enabled.
// eslint-disable-next-line no-process-env
const includeOpbeat = Object.keys(process.env)
    .includes('OPBEAT_OVERRIDE');
const opbeatEnabled = includeOpbeat || !isDevelopment(config.get('env'));

// Setup Opbeat to query the data.
opbeat.start({
    active: opbeatEnabled,
    appId: config.get('opbeatAppId'),
    captureExceptions: true,
    ignoreUrls: config.get('opbeatIgnoreUrls').split(','),
    logBody: true,
    organizationId: config.get('opbeatOrganisationId'),
    secretToken: config.get('opbeatSecretToken'),
});

opbeat.handleUncaughtExceptions(require('./exception'));

module.exports = opbeat;
