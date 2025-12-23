const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: true, // 🔥 REQUIRED for CloudClusters
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected (CloudClusters)");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
