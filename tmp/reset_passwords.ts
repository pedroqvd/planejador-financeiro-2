import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPasswords() {
    const password = 'pedrogostoso23';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const emails = ['pedroquevedo@wealthcash.com', 'pedro@wealthcash.com'];
    
    for (const email of emails) {
        console.log(`Resetting password for: ${email}`);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
    }
    
    console.log('Passwords reset successfully to "pedrogostoso23"');
}

resetPasswords()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
