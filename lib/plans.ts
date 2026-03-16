export const BILLING_CYCLES = {
    monthly: {
        label: 'Mensal',
        price: 29.90,
        frequency: 1,
        frequencyType: 'months' as const,
        discount: null,
    },
    semiannual: {
        label: 'Semestral',
        price: 24.90, // per month
        totalPrice: 149.40,
        frequency: 6,
        frequencyType: 'months' as const,
        discount: '17% OFF',
    },
    annual: {
        label: 'Anual',
        price: 19.90, // per month
        totalPrice: 238.80,
        frequency: 12,
        frequencyType: 'months' as const,
        discount: '33% OFF',
    },
} as const;

export type BillingCycleKey = keyof typeof BILLING_CYCLES;

export const PLANS = {
    free: {
        name: 'Gratuito',
        limits: {
            transactionsPerMonth: 100,
            goalsCount: 3,
            budgetsCount: 2,
            aiRequestsPerDay: 15,
        },
        features: ['100 transações/mês', '3 metas', '2 orçamentos', '15 consultas IA/dia'],
    },
    paid: {
        name: 'WealthCash',
        limits: {
            transactionsPerMonth: Infinity,
            goalsCount: Infinity,
            budgetsCount: Infinity,
            aiRequestsPerDay: 200,
        },
        features: [
            'Transações ilimitadas',
            'Metas e orçamentos ilimitados',
            'IA Advisor ilimitado',
            'Importação OFX/CSV/PDF',
            'OCR de recibos',
            'Conexão bancária Open Finance',
            'Notificações inteligentes',
            'Relatórios avançados',
            'Suporte prioritário',
        ],
    },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanLimits(plan: string) {
    // Backwards compatibility: treat 'pro' and 'premium' as 'paid'
    const normalized = (plan?.toLowerCase() || 'free');
    if (normalized === 'paid' || normalized === 'pro' || normalized === 'premium') {
        return PLANS.paid.limits;
    }
    return PLANS.free.limits;
}

export function isPaidPlan(plan: string): boolean {
    const p = plan?.toLowerCase() || 'free';
    return p === 'paid' || p === 'pro' || p === 'premium';
}

export function checkMonthlyLimit(currentCount: number, limit: number) {
    if (limit === Infinity) return true;
    return currentCount < limit;
}
