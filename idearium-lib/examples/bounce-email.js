/**
 * This is an example file that demonstrates how to create `publish` and `consume` functions.
 */

var ideariumMq = require('@idearium/idearium-lib/common/idearium-mq'),
    log = require('@idearium/idearium-lib/common/log'),
    exchange = 'bounce-email';

/**
 * Publish a message.
 * @param  {Object} data Data object
 */
function publish(data) {

    // IMPORTANT: ideariumMq.publish expects a promise as the return value from the callback e.g. channel.publish is a promise based function
    ideariumMq.publish((channel) => {

        // create exchange, durable make sure exchange will persist to disk
        return channel.assertExchange(exchange, 'fanout', { durable: true })
        .then(() => {
            log.debug({ data: data }, 'Published to ' + exchange + ' exchange.');
            // publish message to exchange, persistent settings ensure message is saved to disk in case of server failure
            return channel.publish(exchange, '', new Buffer(JSON.stringify(data)), { persistent: true });
        });

    });

}

function consume() {

    // IMPORTANT: ideariumMq.consume expects a promise as the return value from the callback e.g. channel.consume is a promise based function
    ideariumMq.consume((channel) => {

        var queueName = 'tracker',
            processMessage = (msg) => {

                log.debug({ mq: msg }, 'Consumed from ' + exchange + ' exchange.');

                try {
                    var data = JSON.parse(msg.content.toString());
                } catch (e) {
                    // acknowledge marked the message as processed so it can't be sent to other queues
                    return channel.ack(msg);
                }

                if (!data) {
                    return channel.ack(msg);
                }

                console.log('== message data');
                console.log(data);

                return channel.ack(msg);

                // if you don't want to acknowledge the message so that it can be processed again (retry), simply 'return;'
            };

        // create exchange, durable make sure exchange will persist to disk
        return channel.assertExchange(exchange, 'fanout', { durable: true })
        .then(() => {
            // create queue, durable make sure queue will persist to disk
            return channel.assertQueue(queueName, { durable: true });
        })
        .then(() => {
            // bind queue to exchange, with empty string as the routing key since the exchange type is 'fanout'
            return channel.bindQueue(queueName, exchange, '');
        })
        .then(() => {
            // consume and process the message, noAck tells rabbitmq to wait for aknowledgement
            return channel.consume(queueName, processMessage, { noAck: false });
        });

    });

}

module.exports = {
    publish: publish,
    consume: consume
};
