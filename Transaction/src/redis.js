import Redis from "ioredis";

const redisClient = new Redis({
    host: process.env.APP_REDIS_HOST,
    port: process.env.APP_REDIS_PORT,
    password: process.env.APP_REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});

const connectRedis = async () => {
    try {
        if (
            redisClient.status === "ready" ||
            redisClient.status === "connected" ||
            redisClient.status === "connect" ||
            redisClient.status === "connecting"
        ) {
            console.log("Transaction :: Redis client is already connecting/connected.");
            return;
        }

        await redisClient.connect();
        return;
    } catch (error) {
        console.error("Error while connecting to Redis:", error);
    }
};

// Event listeners for Redis client
redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

redisClient.on("end", () => {
    console.log("Redis connection closed. Attempting to reconnect...");
    setTimeout(connectRedis, 1000);
});

export { connectRedis, redisClient };
