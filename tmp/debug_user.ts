import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    const email = 'pedro@wealthcash.com';
    console.log(`Checking user: ${email}`);
    
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            mfaEnabled: true,
            mfaSecret: true,
            // Add other relevant fields if needed
        }
    });

    if (!user) {
        console.log('User not found.');
        const allUsers = await prisma.user.findMany({ select: { email: true }, take: 10 });
        console.log('Existing users (first 10):', allUsers.map(u => u.email));
    } else {
        console.log('User found:', JSON.stringify(user, null, 2));
        
        const logs = await prisma.auditLog.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        console.log('Recent audit logs:', JSON.stringify(logs, null, 2));
    }
}

checkUser()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
