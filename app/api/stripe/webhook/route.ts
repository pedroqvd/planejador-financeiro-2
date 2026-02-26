import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// Disable body parsing — Stripe needs raw body
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan;
                const subscriptionId = session.subscription as string;

                if (userId && plan) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            plan,
                            stripeSubscriptionId: subscriptionId,
                            stripeCustomerId: session.customer as string,
                        },
                    });
                    console.log(`[Stripe] User ${userId} upgraded to ${plan}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    const active = ['active', 'trialing'].includes(subscription.status);
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            plan: active ? (subscription.metadata?.plan || 'pro') : 'free',
                            stripeSubscriptionId: subscription.id,
                        },
                    });
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { plan: 'free', stripeSubscriptionId: null },
                    });
                    console.log(`[Stripe] User ${userId} downgraded to free`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                const user = await prisma.user.findFirst({
                    where: { stripeCustomerId: customerId },
                });

                if (user) {
                    console.warn(`[Stripe] Payment failed for user ${user.id}`);
                    // Could send email notification here
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
