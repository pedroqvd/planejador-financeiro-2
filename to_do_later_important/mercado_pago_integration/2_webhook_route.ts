// @ts-nocheck
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
// import { prisma } from '@/lib/prisma';

/**
 * Webhook para receber os gatilhos do Mercado Pago quando o cliente pagar ou cancelar.
 * Você deve cadastrar esta URL no painel do MP: 
 * https://seusite.com.br/api/webhooks/mercadopago
 */

// const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export async function POST(request: Request) {
    /*
    try {
        const body = await request.json();
        
        // O Mercado Pago manda o type de ação e os dados no body.data.id
        const action = body.action; 
        const type = body.type;

        // Se for um pagamento aprovado de assinatura
        if (type === 'payment' && action === 'payment.created') {
            const paymentId = body.data.id;
            const paymentClient = new Payment(client);
            const paymentInfo = await paymentClient.get({ id: paymentId });

            if (paymentInfo.status === 'approved') {
                const userId = paymentInfo.external_reference; 
                // Assinamos o usuário!
                await prisma.user.update({
                    where: { id: userId },
                    data: { plan: 'pro' } // ou buscar pelo ID do plano
                });
            }
        }

        // Se for um cancelamento de assinatura
        if (type === 'subscription_preapproval') {
            const subId = body.data.id;
            const preApprovalClient = new PreApproval(client);
            const subInfo = await preApprovalClient.get({ id: subId });

            if (subInfo.status === 'cancelled') {
                const userId = subInfo.external_reference;
                await prisma.user.update({
                    where: { id: userId },
                    data: { plan: 'free' } // Downgrade automático
                });
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Erro no Webhook MP:', error);
        return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 });
    }
    */

    return NextResponse.json({ message: 'Boilerplate Webhook MP' });
}
