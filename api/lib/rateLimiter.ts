export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface ClientRecord {
  timestamps: number[];
}

export class RateLimiter {
  private clients = new Map<string, ClientRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(options: RateLimitOptions = { windowMs: 60000, maxRequests: 20 }) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
  }

  /**
   * Checks if an IP is within the rate limit.
   */
  public check(ip: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const client = this.clients.get(ip) || { timestamps: [] };

    // Filter out timestamps outside window
    const validTimestamps = client.timestamps.filter((t) => now - t < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    validTimestamps.push(now);
    this.clients.set(ip, { timestamps: validTimestamps });

    return {
      allowed: true,
      remaining: this.maxRequests - validTimestamps.length,
    };
  }

  public reset(): void {
    this.clients.clear();
  }
}

export const checkFixRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 20,
});
