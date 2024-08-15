import { connectRedis } from "./redis.js";
import connectDB from "./db/index.js";
import amqp from "amqplib";
import { notificationWorker } from "./worker.js";

(async () => {
    await connectDB()
        .then(async () => await connectRedis())
        .then(async () => {
            try {
                const connection = await amqp.connect(process.env.RABBITMQ_URI);
                const channel = await connection.createChannel();
                const queue = "notification_queue";
                await channel.assertQueue(queue, {
                    durable: true,
                });
                channel.consume(queue, async (data) => {
                    const parseData = JSON.parse(Buffer.from(data.content));
                    await notificationWorker(parseData);
                    channel.ack(data);
                    console.log("Notification :: Processed");
                });
            } catch (error) {
                console.log("Error while connecting to RabbitMQ", error);
            }
        })
        .catch((e) => console.log("Error ::", e));
})();
