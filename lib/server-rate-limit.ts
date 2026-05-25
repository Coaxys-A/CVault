import "server-only";

import { getRedis } from "@/lib/server-redis";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "local";
}

export async function isRateLimited(request: Request, scope: string, limit: number, windowMs: number): Promise<boolean> {
  const redis = await getRedis();
  const key = `cvault:rate:${scope}:${clientIp(request)}`;

  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.pExpire(key, windowMs);
    return count > limit;
  }

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
