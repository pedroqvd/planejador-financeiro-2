/**
 * TODO LATER: MERCADO PAGO INTEGRATION (GO-TO-MARKET)
 * 
 * Este arquivo contém o boilerplate principal para quando formos ativar 
 * a cobrança real (R$ 14,90/mês) do plano PRO via Mercado Pago.
 * 
 * Requisitos antes de ativar:
 * 1. npm install mercadopago
 * 2. Adicionar MERCADOPAGO_ACCESS_TOKEN no .env
 * 3. Mover este arquivo para /app/api/checkout/route.ts
 */

import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
// import { auth } from '@/lib/auth';

// 1. Inicializa o cliente com o Token de Produção
// const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export async function POST(request: Request) {
    /* Descomentar na fase de Produção
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: 'plano_pro_mensal',
                        title: 'WealthCash PRO - Plano Anual (12x)',
                        quantity: 1,
                        unit_price: 14.90, // Valor promocional
                        currency_id: 'BRL',
                    }
                ],
                payer: {
                    email: session.user.email || '',
                    name: session.user.name || '',
                },
                back_urls: {
                    success: \`\${process.env.NEXT_PUBLIC_APP_URL}/upgrade?success=true\`,
                    failure: \`\${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=true\`,
                    pending: \`\${process.env.NEXT_PUBLIC_APP_URL}/upgrade?pending=true\`
                },
                auto_return: 'approved',
                // notification_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago\`,
                external_reference: session.user.id, // Fundamental para o Webhook saber quem pagou
            }
        });

        // Retorna o link mágico de pagamento do MP para redirecionar o usuário
        return NextResponse.json({ url: response.init_point });
    } catch (error) {
        console.error('Erro MercadoPago:', error);
        return NextResponse.json({ error: 'Erro ao gerar checkout do Mercado Pago' }, { status: 500 });
    }
    */

    return NextResponse.json({ message: 'Boilerplate salvo para o futuro.' });
}
