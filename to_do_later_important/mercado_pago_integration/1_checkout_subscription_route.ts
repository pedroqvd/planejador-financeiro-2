import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from 'mercadopago';
// import { auth } from '@/lib/auth';

/**
 * Rota para gerar Assinaturas (PreApproval) do Mercado Pago
 * Instalação: npm i mercadopago
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/subscriptions
 */

// const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export async function POST(request: Request) {
    /* 
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const { planId } = await request.json(); // ex: 'pro' ou 'premium'

        // Você pode criar o PreApprovalPlan pelo painel do MP ou via API uma vez.
        // Aqui assumimos que você já tem o preapproval_plan_id salvo no seu .env
        const mpPlanId = planId === 'premium' 
            ? process.env.MP_PLAN_PREMIUM_ID 
            : process.env.MP_PLAN_PRO_ID;

        const preApproval = new PreApproval(client);

        // Cria a intenção de Assinatura para o cliente
        const subscription = await preApproval.create({
            body: {
                preapproval_plan_id: mpPlanId,
                payer_email: session.user.email || '',
                card_token_id: '...', // Se for usar Checkout Transparente
                external_reference: session.user.id, // OBRIGATÓRIO: É como você acha o user no Webhook
                status: 'pending' // Ou 'authorized'
            }
        });

        // Retorna o link para o usuário colocar os dados do cartão (Checkout Pro)
        return NextResponse.json({ 
            url: subscription.init_point, 
            subscriptionId: subscription.id 
        });

    } catch (error) {
        console.error('Erro MercadoPago Subscription:', error);
        return NextResponse.json({ error: 'Erro ao assinar plano.' }, { status: 500 });
    }
    */
    return NextResponse.json({ message: 'Boilerplate Checkout Subscription Mercado Pago' });
}
