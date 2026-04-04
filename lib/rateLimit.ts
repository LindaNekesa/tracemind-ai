// Simple in-memory rate limiter (resets on server restart)
// For production use Redis instead

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count, resetIn: entry.resetAt - now };
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}
