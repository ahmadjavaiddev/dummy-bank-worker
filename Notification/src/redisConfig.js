const redisConfig = {
    host: process.env.APP_REDIS_HOST,
    port: process.env.APP_REDIS_PORT,
    password: process.env.APP_REDIS_PASSWORD,
    maxRetriesPerRequest: null,
};

export { redisConfig };
