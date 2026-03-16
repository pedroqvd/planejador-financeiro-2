import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/rate-limit';
import { getPlanLimits } from '@/lib/plans';
import { sanitize } from '@/lib/utils';

const MAX_AMOUNT = 99_999_999;
const VALID_ICONS = ['Target', 'Plane', 'Home', 'GraduationCap', 'Car', 'Heart', 'Shield', 'Gift', 'Wallet', 'PiggyBank', 'Gem'];
const VALID_COLORS = ['sky', 'violet', 'emerald', 'amber', 'rose', 'indigo', 'teal', 'orange', 'pink', 'cyan'];

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`goals:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    const [goals, user] = await Promise.all([
        prisma.goal.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: { preferredCurrency: true }
        })
    ]);

    return NextResponse.json({
        goals,
        preferredCurrency: user?.preferredCurrency || 'BRL'
    });
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`goals:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        const planLimits = getPlanLimits(session.user.plan || 'free');

        const goalCount = await prisma.goal.count({ where: { userId: session.user.id } });

        if (planLimits.goalsCount !== Infinity && goalCount >= planLimits.goalsCount) {
            return NextResponse.json(
                { error: `Limite de ${planLimits.goalsCount} meta(s) no plano Free. Faça upgrade para o Pro!` },
                { status: 403 }
            );
        }

        // Hard cap regardless
        if (goalCount >= 50) {
            return NextResponse.json({ error: 'Limite máximo de 50 metas atingido.' }, { status: 400 });
        }

        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const name = sanitize(String(body.name || ''));
        const target = parseFloat(body.target);
        const deadline = sanitize(String(body.deadline || ''));
        const icon = VALID_ICONS.includes(String(body.icon || '')) ? String(body.icon) : 'Target';
        const color = VALID_COLORS.includes(String(body.color || '')) ? String(body.color) : 'sky';

        if (!name || name.length < 2) {
            return NextResponse.json({ error: 'Nome da meta é obrigatório (mín. 2 caracteres).' }, { status: 400 });
        }

        if (isNaN(target) || target <= 0 || target > MAX_AMOUNT) {
            return NextResponse.json({ error: 'Valor alvo deve ser positivo.' }, { status: 400 });
        }

        // Validate deadline format YYYY-MM
        if (!deadline || !/^\d{4}-\d{2}$/.test(deadline)) {
            return NextResponse.json({ error: 'Prazo inválido (formato: YYYY-MM).' }, { status: 400 });
        }

        const goal = await prisma.goal.create({
            data: {
                name,
                target,
                deadline,
                icon,
                color,
                monthlySuggestion: 0,
                userId: session.user.id,
            },
        });

        return NextResponse.json(goal, { status: 201 });
    } catch (error) {
        console.error('Goal error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { success } = await ratelimit.limit(`goals:${session.user.id}`);
        if (!success) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    } catch { /* dev fallback */ }

    try {
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const id = String(body.id || '');
        const current = parseFloat(body.current);

        if (!id || id.length > 50) {
            return NextResponse.json({ error: 'ID da meta inválido.' }, { status: 400 });
        }

        if (isNaN(current) || current < 0 || current > MAX_AMOUNT) {
            return NextResponse.json({ error: 'Valor deve ser positivo.' }, { status: 400 });
        }

        // IDOR protection: find + update in same userId scope
        const existingGoal = await prisma.goal.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existingGoal) {
            return NextResponse.json({ error: 'Meta não encontrada.' }, { status: 404 });
        }

        if (current > existingGoal.target) {
            return NextResponse.json({ error: 'Valor atual não pode exceder o valor alvo da meta.' }, { status: 400 });
        }

        const goal = await prisma.goal.update({
            where: { id },
            data: { current },
        });

        return NextResponse.json(goal);
    } catch (error) {
        console.error('Goal update error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }); }

        const id = String(body.id || '');
        if (!id || id.length > 50) {
            return NextResponse.json({ error: 'ID da meta inválido.' }, { status: 400 });
        }

        const goal = await prisma.goal.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!goal) {
            return NextResponse.json({ error: 'Meta não encontrada.' }, { status: 404 });
        }

        await prisma.goal.delete({ where: { id } });

        return NextResponse.json({ message: 'Meta removida com sucesso.' });
    } catch (error) {
        console.error('Goal delete error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
