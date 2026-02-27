import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: { referralCode: null },
        });

        if (users.length === 0) {
            return NextResponse.json({ message: 'Todos os usuários antigos já possuem código.' });
        }

        let updatedCount = 0;
        for (const user of users) {
            // Generate a unique short code combining random bytes
            const uniqueCode = `WEALTH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

            await prisma.user.update({
                where: { id: user.id },
                data: { referralCode: uniqueCode },
            });
            updatedCount++;
        }

        return NextResponse.json({ success: true, message: `Populated referralCode for ${updatedCount} users.` });
    } catch (error) {
        console.error('Backfill Error:', error);
        return NextResponse.json({ error: 'Failed to backfill.' }, { status: 500 });
    }
}
