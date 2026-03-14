import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth
vi.mock('@/lib/auth', () => ({
    auth: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        transaction: {
            findMany: vi.fn().mockResolvedValue([]),
            count: vi.fn().mockResolvedValue(0),
            create: vi.fn().mockResolvedValue({}),
            findFirst: vi.fn().mockResolvedValue(null),
            delete: vi.fn().mockResolvedValue({}),
            deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
            aggregate: vi.fn().mockResolvedValue({ _avg: { amount: 0 } }),
            update: vi.fn().mockResolvedValue({}),
        },
        budget: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({}),
        },
        user: {
            findUnique: vi.fn().mockResolvedValue({ fcmToken: 'test-token' }),
        },
        $transaction: vi.fn((actions) => {
            if (typeof actions === 'function') return actions(vi.fn());
            return Promise.all(actions);
        }),
    },
}));

// Mock rate-limit
vi.mock('@/lib/rate-limit', () => ({
    ratelimit: {
        limit: vi.fn().mockResolvedValue({ success: true }),
    },
    getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

// Mock plans
vi.mock('@/lib/plans', () => ({
    getPlanLimits: vi.fn().mockReturnValue({ transactionsPerMonth: Infinity, goalsCount: Infinity, budgetsCount: Infinity, aiRequestsPerDay: Infinity }),
    checkMonthlyLimit: vi.fn().mockReturnValue(true),
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GET, POST, DELETE } from '@/app/api/transactions/route';

function makeRequest(method: string, body?: Record<string, unknown>, params?: string): Request {
    const url = `http://localhost/api/transactions${params ? `?${params}` : ''}`;
    return new Request(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
}

describe('GET /api/transactions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if not authenticated', async () => {
        (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
        const res = await GET(makeRequest('GET'));
        expect(res.status).toBe(401);
    });

    it('should return paginated transactions', async () => {
        (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            user: { id: 'user-1', plan: 'free' },
        });
        (prisma.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
            { id: '1', name: 'Test', amount: 100, type: 'expense', category: 'Alimentação', date: new Date() },
        ]);
        (prisma.transaction.count as ReturnType<typeof vi.fn>).mockResolvedValueOnce(1);

        const res = await GET(makeRequest('GET'));
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.transactions).toHaveLength(1);
        expect(data.total).toBe(1);
        expect(data.page).toBe(1);
    });
});

describe('POST /api/transactions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
            user: { id: 'user-1', plan: 'pro' },
        });
    });

    it('should return 401 if not authenticated', async () => {
        (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
        const res = await POST(makeRequest('POST', { name: 'Test', category: 'Alimentação', amount: 100, type: 'expense' }));
        expect(res.status).toBe(401);
    });

    it('should return 400 if name is missing', async () => {
        const res = await POST(makeRequest('POST', { category: 'Alimentação', amount: 100, type: 'expense' }));
        expect(res.status).toBe(400);
    });

    it('should return 400 for invalid type', async () => {
        const res = await POST(makeRequest('POST', { name: 'Test', category: 'Alimentação', amount: 100, type: 'invalid' }));
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('income');
    });

    it('should return 400 for invalid category', async () => {
        const res = await POST(makeRequest('POST', { name: 'Test', category: 'Invalida', amount: 100, type: 'expense' }));
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain('Categoria');
    });

    it('should return 400 for negative amount', async () => {
        const res = await POST(makeRequest('POST', { name: 'Test', category: 'Alimentação', amount: -50, type: 'expense' }));
        expect(res.status).toBe(400);
    });

    it('should return 400 for amount exceeding max', async () => {
        const res = await POST(makeRequest('POST', { name: 'Test', category: 'Alimentação', amount: 100_000_000, type: 'expense' }));
        expect(res.status).toBe(400);
    });

    it('should create transaction and return 201', async () => {
        const newTx = { id: 'tx-1', name: 'Supermercado', category: 'Alimentação', amount: 150, type: 'expense', date: new Date() };
        (prisma.transaction.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce(newTx);
        (prisma.budget.updateMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 1 });

        const res = await POST(makeRequest('POST', { name: 'Supermercado', category: 'Alimentação', amount: 150, type: 'expense' }));
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.name).toBe('Supermercado');
    });

    it('should update budget when creating expense', async () => {
        (prisma.transaction.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'tx-1', type: 'expense', category: 'Alimentação', date: new Date() });
        (prisma.budget.updateMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 1 });

        await POST(makeRequest('POST', { name: 'Test', category: 'Alimentação', amount: 100, type: 'expense' }));

        expect(prisma.budget.updateMany).toHaveBeenCalled();
    });
});

describe('DELETE /api/transactions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
            user: { id: 'user-1', plan: 'free' },
        });
    });

    it('should return 401 if not authenticated', async () => {
        (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
        const res = await DELETE(makeRequest('DELETE', { id: 'tx-1' }));
        expect(res.status).toBe(401);
    });

    it('should return 404 if transaction not found (IDOR protection)', async () => {
        (prisma.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

        const res = await DELETE(makeRequest('DELETE', { id: 'tx-nonexistent' }));
        expect(res.status).toBe(404);
    });

    it('should delete transaction and return success', async () => {
        (prisma.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{
            id: 'tx-1', userId: 'user-1', type: 'income', amount: 500, category: 'Salário', date: new Date(),
        }]);
        (prisma.transaction.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 1 });

        const res = await DELETE(makeRequest('DELETE', { id: 'tx-1' }));
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.message).toContain('removida');
    });

    it('should decrement budget when deleting expense', async () => {
        (prisma.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{
            id: 'tx-1', userId: 'user-1', type: 'expense', amount: 100, category: 'Alimentação', date: new Date(),
        }]);
        (prisma.transaction.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 1 });
        (prisma.budget.updateMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 1 });

        await DELETE(makeRequest('DELETE', { id: 'tx-1' }));
        expect(prisma.budget.updateMany).toHaveBeenCalled();
    });
});
