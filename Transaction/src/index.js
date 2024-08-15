import amqp from "amqplib";
import connectDB from "./db/index.js";
import { transactionWorker } from "./worker.js";
import { QueueManager } from "./managers/QueueManager.js";
import { connectRedis } from "./redis.js";

const queueManager = new QueueManager();

(async () => {
    await connectDB()
        .then(async () => await connectRedis())
        .then(async () => await queueManager.connect())
        .then(async () => {
            try {
                const connection = await amqp.connect(process.env.RABBITMQ_URI);
                const channel = await connection.createChannel();
                const queue = "transaction_queue";
                await channel.assertQueue(queue, {
                    durable: true,
                });
                channel.consume(queue, async (data) => {
                    const parentData = JSON.parse(Buffer.from(data.content));
                    await transactionWorker(parentData);
                    await channel.ack(data);
                    console.log("Processed");
                });
            } catch (error) {
                console.log("Error while connecting to RabbitMQ", error);
            }
        })
        .catch((e) => console.log("Error ::", e));
})();
