import "server-only";

import { createClient, type RedisClientType } from "redis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

let client: RedisClientType | null = null;
let connection: Promise<RedisClientType | null> | null = null;
let disabled = false;

export async function getRedis(): Promise<RedisClientType | null> {
  if (disabled) return null;
  if (client?.isOpen) return client;
  if (connection) return connection;

  connection = (async () => {
    const redis = createClient({ url: REDIS_URL });
    redis.on("error", (error) => {
      console.error("Redis error", error);
    });

    try {
      await redis.connect();
      client = redis as RedisClientType;
      return client;
    } catch (error) {
      console.error("Redis unavailable, using in-memory fallback", error);
      disabled = true;
      return null;
    } finally {
      connection = null;
    }
  })();

  return connection;
}
