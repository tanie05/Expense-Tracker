const { Kafka } = require('kafkajs');
 
exports.handler = async (event, context) => {

    try {

        // BUG 1 & 2 LIE SOMEWHERE AROUND HERE

        const kafka = new Kafka({

            clientId: 'dario-health-producer',

            brokers: [process.env.MSK_BROKER_URL]

        });
 
        const producer = kafka.producer();

        await producer.connect();
 
        const body = JSON.parse(event.body);
 
        // Publish event to MSK

        await producer.send({

            topic: 'user-eligibility-events',

            messages: [{ value: JSON.stringify(body) }],

        });
 
        return { statusCode: 200, body: 'Event Published Successfully' };
 
    } catch (error) {

        console.error('Failed to publish event:', error);

        return { statusCode: 500, body: 'Internal Server Error' };

    }

};
 