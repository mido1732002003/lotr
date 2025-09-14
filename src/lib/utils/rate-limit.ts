import { LRUCache } from 'lru-cache';
import { NextRequest } from 'next/server';

export interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

export interface RateLimitResult {
  limit: number;
  remaining: number;
  success: boolean;
}

export class RateLimiter {
  private cache: LRUCache<string, number[]>;
  
  constructor(private options: RateLimitOptions = {
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }) {
    this.cache = new LRUCache<string, number[]>({
      max: 5000, // Store up to 5000 unique tokens
      ttl: options.interval,
    });
  }
  
  check(token: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.options.interval;
    
    const timestamps = this.cache.get(token) || [];
    const recentTimestamps = timestamps.filter(t => t > windowStart);
    
    if (recentTimestamps.length >= this.options.uniqueTokenPerInterval) {
      return {
        limit: this.options.uniqueTokenPerInterval,
        remaining: 0,
        success: false,
      };
    }
    
    recentTimestamps.push(now);
    this.cache.set(token, recentTimestamps);
    
    return {
      limit: this.options.uniqueTokenPerInterval,
      remaining: this.options.uniqueTokenPerInterval - recentTimestamps.length,
      success: true,
    };
  }
  
  static getToken(request: NextRequest): string {
    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || real || 'unknown';
    
    // Combine with user agent for better uniqueness
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    return `${ip}:${userAgent}`;
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  api: new RateLimiter({
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 100, // 100 requests per minute
  }),
  
  payment: new RateLimiter({
    interval: 300000, // 5 minutes
    uniqueTokenPerInterval: 10, // 10 payment attempts per 5 minutes
  }),
  
  admin: new RateLimiter({
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 50, // 50 requests per minute
  }),
  
  auth: new RateLimiter({
    interval: 900000, // 15 minutes
    uniqueTokenPerInterval: 5, // 5 auth attempts per 15 minutes
  }),
};

// Middleware helper
export async function withRateLimit(
  request: NextRequest,
  limiter: RateLimiter = rateLimiters.api
): Promise<NextRequest | Response> {
  const token = RateLimiter.getToken(request);
  const result = limiter.check(token);
  
  if (!result.success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'Retry-After': '60',
      },
    });
  }
  
  return request;
}