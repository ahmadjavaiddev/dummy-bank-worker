import { QueueManager } from "./QueueManager.js";

const queueManager = new QueueManager();

async function emailQueue(userName, email, type, token) {
    try {
        const data = {
            userName: userName,
            email: email,
            type: type,
            token: token,
        };

        await queueManager.sendToQueue("email_queue", data);
    } catch (error) {
        console.error("Failed to send email ::", error);
    }
}

async function transactionQueue(transactionId) {
    try {
        await queueManager.sendToQueue("transaction_queue", transactionId);
    } catch (error) {
        console.error("Failed to send transaction ::", error);
    }
}

async function notificationQueue(userId, type, message) {
    try {
        const data = {
            userId: userId,
            type: type,
            message: message,
        };

        await queueManager.sendToQueue("notification_queue", data);
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
}

export { emailQueue, transactionQueue, notificationQueue };
