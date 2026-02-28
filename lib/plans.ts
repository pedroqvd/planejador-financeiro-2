export const PLANS = {
    free: {
        name: 'Free',
        priceId: '',
        limits: {
            transactionsPerMonth: 100,
            goalsCount: 2,
            budgetsCount: 1,
            aiRequestsPerMonth: 0,
        },
        features: ['100 transações/mês', '2 metas', '1 orçamento'],
    },
    pro: {
        name: 'Pro',
        priceId: 'pro_monthly', // Para futuro uso com Mercado Pago
        limits: {
            transactionsPerMonth: 500,
            goalsCount: 10,
            budgetsCount: 5,
            aiRequestsPerMonth: 50,
        },
        features: ['500 transações/mês', '10 metas', '5 orçamentos', 'Assessor de Investimentos IA (Básico)'],
    },
    premium: {
        name: 'Premium',
        priceId: 'premium_monthly', // Para futuro uso com Mercado Pago
        limits: {
            transactionsPerMonth: Infinity,
            goalsCount: Infinity,
            budgetsCount: Infinity,
            aiRequestsPerMonth: 300,
        },
        features: ['Transações ilimitadas', 'Metas ilimitadas', 'Orçamentos ilimitados', 'Assessor IA (Avançado)', 'Notificações Inteligentes'],
    },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanLimits(plan: string) {
    const normalizedPlan = (plan?.toLowerCase() || 'free') as PlanKey;
    return (PLANS[normalizedPlan] || PLANS.free).limits;
}

export function checkMonthlyLimit(currentCount: number, limit: number) {
    if (limit === Infinity) return true;
    return currentCount < limit;
}
