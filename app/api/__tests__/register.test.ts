import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        budget: {
            createMany: vi.fn(),
        },
    },
}));

// Mock rate-limit (always allow)
vi.mock('@/lib/rate-limit', () => ({
    authRatelimit: {
        limit: vi.fn().mockResolvedValue({ success: true, remaining: 5 }),
    },
    getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('$2a$12$hashedpassword'),
    },
}));

import { prisma } from '@/lib/prisma';

// Import the route handler
import { POST } from '@/app/api/register/route';

function makeRequest(body: Record<string, unknown>): Request {
    return new Request('http://localhost/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('POST /api/register', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if name is missing', async () => {
        const res = await POST(makeRequest({ email: 'test@test.com', password: '123456' }));
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('obrigatórios');
    });

    it('should return 400 if email is missing', async () => {
        const res = await POST(makeRequest({ name: 'Test', password: '123456' }));
        expect(res.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
        const res = await POST(makeRequest({ name: 'Test', email: 'test@test.com' }));
        expect(res.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
        const res = await POST(makeRequest({ name: 'Test', email: 'notanemail', password: '123456' }));
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('email');
    });

    it('should return 400 for password shorter than 6 chars', async () => {
        const res = await POST(makeRequest({ name: 'Test', email: 'test@test.com', password: '12345' }));
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('6');
    });

    it('should return 400 for name shorter than 2 chars', async () => {
        const res = await POST(makeRequest({ name: 'T', email: 'test@test.com', password: '123456' }));
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('2');
    });

    it('should return 409 if user already exists', async () => {
        (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'existing' });

        const res = await POST(makeRequest({ name: 'Test', email: 'existing@test.com', password: '123456' }));
        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.error).toContain('cadastrado');
    });

    it('should return 201 for valid registration', async () => {
        (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
        (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'new-user-id', name: 'Test', email: 'new@test.com' });
        (prisma.budget.createMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 5 });

        const res = await POST(makeRequest({ name: 'Test User', email: 'new@test.com', password: '123456' }));
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.message).toContain('sucesso');
    });

    it('should sanitize name to remove dangerous characters', async () => {
        (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
        (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'test' });
        (prisma.budget.createMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 5 });

        await POST(makeRequest({ name: '<script>alert("xss")</script>', email: 'xss@test.com', password: '123456' }));

        // The create call should have sanitized the name
        const createCall = (prisma.user.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(createCall.data.name).not.toContain('<');
        expect(createCall.data.name).not.toContain('>');
    });

    it('should return 400 for invalid JSON body', async () => {
        const req = new Request('http://localhost/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: 'not json',
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });
});
