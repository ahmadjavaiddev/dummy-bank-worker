import Redis from "ioredis";
import { redisConfig } from "./redisConfig.js";

const redisClient = new Redis(redisConfig);

const connectRedis = async () => {
    try {
        if (
            redisClient.status === "ready" ||
            redisClient.status === "connected" ||
            redisClient.status === "connect" ||
            redisClient.status === "connecting"
        ) {
            console.log("Notification :: Redis client is already connecting/connected.");
            return;
        }

        await redisClient.connect();
        return;
    } catch (error) {
        console.error("Error while connecting to Redis:", error);
    }
};

// Event listeners for Redis client
redisClient.on("connect", () => {
    console.log("Notification :: Redis Connected");
});

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

redisClient.on("end", () => {
    console.log("Redis connection closed. Attempting to reconnect...");
    setTimeout(connectRedis, 1000);
});

export { connectRedis, redisClient };
