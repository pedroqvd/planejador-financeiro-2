import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, PLANS, PlanKey } from '@/lib/stripe';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { plan } = await request.json();

        if (!plan || !['pro', 'premium'].includes(plan)) {
            return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 500 });
        }

        const planConfig = PLANS[plan as PlanKey];
        if (!('stripePriceId' in planConfig) || !planConfig.stripePriceId) {
            return NextResponse.json({ error: 'Price ID do Stripe não configurado para este plano.' }, { status: 500 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
        }

        // Create or retrieve Stripe customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId },
            });
        }

        // Create checkout session
        const origin = request.headers.get('origin') || 'http://localhost:3000';
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
            success_url: `${origin}/settings?success=true&plan=${plan}`,
            cancel_url: `${origin}/settings?canceled=true`,
            metadata: { userId: user.id, plan },
            subscription_data: {
                metadata: { userId: user.id, plan },
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: 'Erro ao criar sessão de pagamento.' }, { status: 500 });
    }
}
