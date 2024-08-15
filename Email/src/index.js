import amqp from "amqplib";
import { sendEmail } from "./sendEmail.js";

(async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URI);
        console.log("Connected To RabbitMQ");
        const channel = await connection.createChannel();
        const queue = "email_queue";
        await channel.assertQueue(queue, {
            durable: true,
        });
        channel.consume(queue, async (data) => {
            const parentData = JSON.parse(Buffer.from(data.content));
            await sendEmail(parentData);
            await channel.ack(data);
            console.log("Processed");
        });
    } catch (error) {
        console.log("Error while connecting to RabbitMQ", error);
    }
})();
