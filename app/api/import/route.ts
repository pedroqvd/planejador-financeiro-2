import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit, getClientIp } from '@/lib/rate-limit';
import { parseOFX, parseCSV } from '@/lib/parsers';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Plan gating: Import is Pro+ only
    const userPlan = session.user.plan || 'free';
    if (userPlan === 'free') {
        return NextResponse.json(
            { error: 'Importação de arquivos é exclusiva do plano Pro. Faça upgrade!' },
            { status: 403 }
        );
    }

    // Rate limit (stricter — 5 imports per hour)
    try {
        const ip = getClientIp(request);
        const { success } = await ratelimit.limit(`import:${ip}`);
        if (!success) return NextResponse.json({ error: 'Muitas importações. Tente novamente depois.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB).' }, { status: 400 });
        }

        // Validate MIME type
        const allowedTypes = ['text/plain', 'text/csv', 'application/csv', 'application/x-ofx', 'application/octet-stream'];
        if (file.type && !allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Tipo de arquivo não permitido.' }, { status: 400 });
        }

        const content = await file.text();
        const fileName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '');

        let parsed;
        if (fileName.endsWith('.ofx') || fileName.endsWith('.qfx')) {
            parsed = parseOFX(content);
        } else if (fileName.endsWith('.csv')) {
            parsed = parseCSV(content);
        } else {
            return NextResponse.json({ error: 'Formato não suportado. Use .ofx, .qfx ou .csv' }, { status: 400 });
        }

        if (parsed.length === 0) {
            return NextResponse.json({ error: 'Nenhuma transação encontrada no arquivo.' }, { status: 400 });
        }

        // Limit to 500 transactions per import
        const toImport = parsed.slice(0, 500);

        // Create transactions in batch
        const created = await prisma.transaction.createMany({
            data: toImport.map(t => ({
                name: t.name,
                category: t.category,
                amount: t.amount,
                type: t.type,
                date: new Date(t.date),
                userId: session.user.id,
            })),
        });

        // Update budget spent for expenses — use TRANSACTION month, not current month
        const expensesByMonthCategory = toImport
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const month = new Date(t.date).toISOString().slice(0, 7);
                const key = `${month}:${t.category}`;
                acc[key] = { month, category: t.category, total: (acc[key]?.total || 0) + t.amount };
                return acc;
            }, {} as Record<string, { month: string; category: string; total: number }>);

        for (const { month, category, total } of Object.values(expensesByMonthCategory)) {
            await prisma.budget.updateMany({
                where: {
                    userId: session.user.id,
                    category,
                    month,
                },
                data: {
                    spent: { increment: total },
                },
            });
        }

        return NextResponse.json({
            message: `${created.count} transações importadas com sucesso!`,
            count: created.count,
        }, { status: 201 });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ error: 'Erro ao processar arquivo.' }, { status: 500 });
    }
}
