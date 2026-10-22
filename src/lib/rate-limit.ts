/**
 * Best-effort fixed-window rate limiter.
 *
 * Caveat, stated plainly: this stores counters in process memory. On Vercel
 * each warm Function instance keeps its own map, so the effective limit is
 * `max * <instance count>` and a cold start resets the window. That is enough
 * to stop a naive script from hammering the login endpoint or the contact form
 * thousands of times a minute, which is the realistic threat for a portfolio.
 *
 * A stricter guarantee would need shared state (Vercel KV / Upstash Redis),
 * which is an extra paid dependency this project does not currently need.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  { max, windowSeconds }: { max: number; windowSeconds: number },
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // Opportunistic cleanup keeps the map from growing without bound on a
    // long-lived instance.
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [existingKey, existing] of buckets) {
        if (existing.resetAt <= now) buckets.delete(existingKey);
      }
    }

    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client identifier. Falls back to a constant when unavailable. */
export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
