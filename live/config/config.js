module.exports = {
    mqUrl: process.env.MQ_URL || 'amqps://idearium:Id3Ar1um@mq.common.idearium.local:5671?heartbeat=5',
    logLevel: process.env.LOG_LEVEL || 'debug'
};
