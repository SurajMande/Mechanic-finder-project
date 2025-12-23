const redisClient = require("./connection");

(async () => {
  await redisClient.set("healthcheck", "ok");
  const value = await redisClient.get("healthcheck");
  console.log(value); // ok
})();
