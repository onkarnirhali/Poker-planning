import { createClient } from "redis";

// Use REDIS_URL from your .env (e.g. redis://localhost:6379)
const redisClient = createClient({ url: process.env.REDIS_URL });

// Log any errors
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// Connect immediately (no need to await here; it will auto-reconnect)
redisClient.connect().catch(console.error);

export default redisClient;