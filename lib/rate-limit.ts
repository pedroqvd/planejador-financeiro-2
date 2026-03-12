import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const isUpstashConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

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

    // Dev: no-op rate limiter (always allows)
    return {
        limit: async () => ({ success: true, limit: maxRequests, remaining: maxRequests, reset: 0, pending: Promise.resolve() }),
    } as unknown as Ratelimit;
}

export const ratelimit = createRatelimit(20, '60 s', 'wealthcash:rl');
export const authRatelimit = createRatelimit(5, '900 s', 'wealthcash:auth-rl');
export const aiRatelimit = createRatelimit(10, '60 s', 'wealthcash:ai-rl');
export const aiCoachRatelimit = createRatelimit(3, '600 s', 'wealthcash:ai-coach-rl');

export function getClientIp(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}
