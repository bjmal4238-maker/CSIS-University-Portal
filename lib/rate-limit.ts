/**
 * In-memory sliding window rate limiter for security hardening.
 * Tracks requests per identifier (IP, user ID, email) within a timeframe.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;       // Maximum allowed requests within window
  windowSeconds: number; // Time window in seconds
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { limit: 10, windowSeconds: 60 }
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);
    return {
      success: true,
      remaining: options.limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (existing.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: options.limit - existing.count,
    resetTime: existing.resetTime,
  };
}

