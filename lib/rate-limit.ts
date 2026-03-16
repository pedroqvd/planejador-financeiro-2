import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const isUpstashConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

// In-memory sliding window fallback when Upstash is not configured.
// This provides basic per-instance rate limiting without external dependencies.
// Note: resets on deploy/restart, does not share state across instances.
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function createMemoryRatelimit(maxRequests: number, windowMs: number): Ratelimit {
    return {
        limit: async (key: string) => {
            const now = Date.now();
            const entry = memoryStore.get(key);

            if (!entry || now >= entry.resetAt) {
                memoryStore.set(key, { count: 1, resetAt: now + windowMs });
                return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowMs, pending: Promise.resolve() };
            }

            if (entry.count >= maxRequests) {
                return { success: false, limit: maxRequests, remaining: 0, reset: entry.resetAt, pending: Promise.resolve() };
            }

            entry.count += 1;
            return { success: true, limit: maxRequests, remaining: maxRequests - entry.count, reset: entry.resetAt, pending: Promise.resolve() };
        },
    } as unknown as Ratelimit;
}

// Parse duration string to milliseconds for memory fallback
function durationToMs(d: string): number {
    const match = d.match(/^(\d+)\s*(s|m|h)$/);
    if (!match) return 60000;
    const val = parseInt(match[1]);
    if (match[2] === 's') return val * 1000;
    if (match[2] === 'm') return val * 60 * 1000;
    return val * 3600 * 1000;
}

function createRatelimit(maxRequests: number, windowSec: Duration, prefix: string): Ratelimit {
    if (isUpstashConfigured) {
        return new Ratelimit({
            redis: new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL!,
                token: process.env.UPSTASH_REDIS_REST_TOKEN!,
            }),
            limiter: Ratelimit.slidingWindow(maxRequests, windowSec),
            analytics: true,
            prefix,
        });
    }

    // Fallback: in-memory rate limiting (works without Redis).
    // The daily AI quota check via Prisma provides the primary abuse protection.
    // This memory fallback prevents burst abuse within a single server instance.
    if (process.env.NODE_ENV === 'production') {
        console.warn(`[Rate Limit] Upstash not configured for "${prefix}". Using in-memory fallback.`);
    }
    return createMemoryRatelimit(maxRequests, durationToMs(String(windowSec)));
}

export const ratelimit = createRatelimit(20, '60 s', 'wealthcash:rl');
export const authRatelimit = createRatelimit(5, '900 s', 'wealthcash:auth-rl');
export const aiRatelimit = createRatelimit(15, '60 s', 'wealthcash:ai-rl');
export const aiCoachRatelimit = createRatelimit(3, '600 s', 'wealthcash:ai-coach-rl');

export function getClientIp(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}
