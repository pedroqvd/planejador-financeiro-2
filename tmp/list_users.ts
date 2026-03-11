import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
        }
    });

    console.log('--- All Registered Users ---');
    console.table(users);
}

listUsers()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
