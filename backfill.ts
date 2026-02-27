import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: { referralCode: null },
        });

        if (users.length === 0) {
            console.log('Todos os usuários antigos já possuem código.');
            return;
        }

        let updatedCount = 0;
        for (const user of users) {
            const uniqueCode = `WEALTH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

            await prisma.user.update({
                where: { id: user.id },
                data: { referralCode: uniqueCode },
            });
            updatedCount++;
        }

        console.log(`Sucesso: Populated referralCode for ${updatedCount} users.`);
    } catch (error) {
        console.error('Backfill Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
