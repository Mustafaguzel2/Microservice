import amqp from "amqplib";
import { logger } from "./logger.js";

let connection = null;
let channel = null;

const EXCHANGE_NAME = "post_events";

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to RabbitMQ" + process.env.RABBITMQ_URL);
    return channel;
  } catch (error) {
    logger.error("Error connecting to RabbitMQ", error);
  }
}

async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectRabbitMQ();
  }
  try {
    await channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message))
    );
    logger.info(`Event published to ${routingKey}`);
  } catch (error) {
    logger.error("Error publishing event", error);
  }
}

async function consumeEvent(routingKey, callback) {
  if (!channel) {
    await connectRabbitMQ();
  }
  const queue = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(queue.queue, EXCHANGE_NAME, routingKey);
  await channel.consume(queue.queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      callback(content);
      channel.ack(msg);
    }
  });
  logger.info(`Consuming event from ${routingKey}`);
}

export { connectRabbitMQ, publishEvent, consumeEvent };
