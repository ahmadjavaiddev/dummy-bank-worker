import User from "./models/user.model.js";
import Notification from "./models/notification.model.js";
import { redisClient } from "./redis.js";

class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const notificationWorker = async (job) => {
    try {
        // Process the job
        const { userId, type, message } = job;

        const userVerified = await User.findOne({
            _id: userId,
            isEmailVerified: true,
        });
        if (!userVerified) {
            throw new ApiError(400, `User - ${userId} is not verified`);
        }

        // Create Notification
        const notification = await Notification.create({
            userId: userId,
            type: type,
            message: message,
        });

        if (!notification) {
            throw new ApiError(400, "Notification not created");
        }

        redisClient.publish("notification", JSON.stringify(notification));
    } catch (error) {
        console.log("Error :: ", error.message);
    }
};

export { notificationWorker };
