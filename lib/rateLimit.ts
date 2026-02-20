// Simple in-memory rate limiter
// For production, use Redis or a dedicated rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = store[identifier];

  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function clearRateLimit(identifier: string) {
  delete store[identifier];
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // Clean up every minute
