import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user?.stripeCustomerId) {
            return NextResponse.json({ error: 'Sem assinatura ativa.' }, { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 500 });
        }

        const origin = request.headers.get('origin') || 'http://localhost:3000';
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${origin}/settings`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Portal error:', error);
        return NextResponse.json({ error: 'Erro ao abrir portal.' }, { status: 500 });
    }
}
