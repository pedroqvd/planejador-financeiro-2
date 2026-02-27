import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('[Stripe] STRIPE_SECRET_KEY not configured — payments disabled');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    typescript: true,
});

// Plan configuration
export const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        transactionsPerMonth: 50,
        maxGoals: 3,
        maxBudgets: 1,
        maxAiInteractions: 5,
        features: ['Dashboard completo', '50 transações/mês', '3 metas', '1 orçamento', '5 consultas IA/dia'],
    },
    pro: {
        name: 'Pro',
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
        price: 14.90,
        transactionsPerMonth: Infinity,
        maxGoals: Infinity,
        maxBudgets: Infinity,
        maxAiInteractions: 50,
        features: ['Tudo ilimitado', '50 consultas IA/dia', 'Import OFX/CSV', 'Relatórios PDF', 'Suporte email'],
    },
    premium: {
        name: 'Premium',
        stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
        price: 29.90,
        transactionsPerMonth: Infinity,
        maxGoals: Infinity,
        maxBudgets: Infinity,
        maxAiInteractions: Infinity,
        features: ['Tudo do Pro', 'IA Ilimitada', 'Alertas inteligentes', 'API access', 'Suporte prioritário'],
    },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanLimits(plan: string) {
    return PLANS[plan as PlanKey] || PLANS.free;
}
