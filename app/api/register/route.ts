import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authRatelimit, getClientIp } from '@/lib/rate-limit';
import { sanitize } from '@/lib/utils';
import crypto from 'crypto';

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function POST(request: Request) {
    try {
        // Rate limiting via Upstash
        const ip = getClientIp(request);
        try {
            const { success, remaining } = await authRatelimit.limit(ip);
            if (!success) {
                return NextResponse.json(
                    { error: 'Muitas tentativas. Tente novamente mais tarde.' },
                    { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
                );
            }
        } catch {
            // If Redis is not configured, continue without rate limiting in dev
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
        }

        const name = sanitize(String(body.name || '')).slice(0, 100);
        const email = String(body.email || '').trim().toLowerCase().slice(0, 254);
        const password = String(body.password || '');
        const referredByCode = body.referredByCode ? String(body.referredByCode).trim().toUpperCase() : null;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Nome, email e senha são obrigatórios.' },
                { status: 400 }
            );
        }

        if (name.length < 2 || name.length > 100) {
            return NextResponse.json(
                { error: 'Nome deve ter entre 2 e 100 caracteres.' },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Formato de email inválido.' },
                { status: 400 }
            );
        }

        if (password.length < 8 || password.length > 128) {
            return NextResponse.json(
                { error: 'A senha deve ter entre 8 e 128 caracteres.' },
                { status: 400 }
            );
        }

        // Timing-safe: always hash password before checking existence
        const hashedPassword = await bcrypt.hash(password, 12);

        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Este email já está cadastrado.' },
                { status: 409 }
            );
        }

        // Handle Referral logic
        let referrerId: string | null = null;
        if (referredByCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode: referredByCode },
                select: { id: true }
            });
            if (referrer) {
                referrerId = referrer.id;
            }
        }

        const newReferralCode = `WEALTH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Create user and increment referrer inside a transaction
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    referralCode: newReferralCode,
                    referredBy: referrerId,
                },
            });

            if (referrerId) {
                await tx.user.update({
                    where: { id: referrerId },
                    data: { referralsCount: { increment: 1 } }
                });
            }

            return newUser;
        });

        // Seed initial budget categories for the new user
        const currentMonth = new Date().toISOString().slice(0, 7);
        await prisma.budget.createMany({
            data: [
                { category: 'Moradia', limit: 3000, spent: 0, month: currentMonth, userId: user.id },
                { category: 'Alimentação', limit: 1500, spent: 0, month: currentMonth, userId: user.id },
                { category: 'Transporte', limit: 600, spent: 0, month: currentMonth, userId: user.id },
                { category: 'Lazer', limit: 500, spent: 0, month: currentMonth, userId: user.id },
                { category: 'Outros', limit: 400, spent: 0, month: currentMonth, userId: user.id },
            ],
        });

        return NextResponse.json(
            { message: 'Conta criada com sucesso!' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor.' },
            { status: 500 }
        );
    }
}
