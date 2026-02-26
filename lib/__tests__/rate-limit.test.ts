import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Redis module before importing rate-limit
vi.mock('@upstash/redis', () => ({
    Redis: vi.fn(),
}));

vi.mock('@upstash/ratelimit', () => ({
    Ratelimit: Object.assign(
        vi.fn().mockImplementation(() => ({
            limit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0, pending: Promise.resolve() }),
        })),
        {
            slidingWindow: vi.fn().mockReturnValue('mock-limiter'),
        }
    ),
}));

describe('rate-limit', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    describe('getClientIp', () => {
        it('should extract IP from x-forwarded-for header', async () => {
            // Import dynamically after mocks
            const { getClientIp } = await import('../rate-limit');

            const request = new Request('http://localhost', {
                headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
            });

            expect(getClientIp(request)).toBe('192.168.1.1');
        });

        it('should extract IP from x-real-ip header', async () => {
            const { getClientIp } = await import('../rate-limit');

            const request = new Request('http://localhost', {
                headers: { 'x-real-ip': '10.0.0.5' },
            });

            expect(getClientIp(request)).toBe('10.0.0.5');
        });

        it('should return "unknown" when no IP headers present', async () => {
            const { getClientIp } = await import('../rate-limit');

            const request = new Request('http://localhost');
            expect(getClientIp(request)).toBe('unknown');
        });

        it('should prefer x-forwarded-for over x-real-ip', async () => {
            const { getClientIp } = await import('../rate-limit');

            const request = new Request('http://localhost', {
                headers: {
                    'x-forwarded-for': '1.2.3.4',
                    'x-real-ip': '5.6.7.8',
                },
            });

            expect(getClientIp(request)).toBe('1.2.3.4');
        });
    });

    describe('rate limiters (dev mode)', () => {
        it('should export ratelimit, authRatelimit, and aiRatelimit', async () => {
            const mod = await import('../rate-limit');
            expect(mod.ratelimit).toBeDefined();
            expect(mod.authRatelimit).toBeDefined();
            expect(mod.aiRatelimit).toBeDefined();
        });

        it('should have a limit method that resolves to success', async () => {
            const { ratelimit } = await import('../rate-limit');
            const result = await ratelimit.limit('test-key');
            expect(result.success).toBe(true);
        });
    });
});
