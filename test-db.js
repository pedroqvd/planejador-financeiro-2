const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_dbBTF7YZcx2R@ep-shiny-art-acpcirxw.sa-east-1.aws.neon.tech/neondb?sslmode=require"
        }
    }
});

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'victorfreitas@wealthcash.com' },
        include: {
            pluggyItems: true,
            transactions: true,
        }
    });

    console.log("User:", user ? user.email : "Not found");
    if (user) {
        console.log("Pluggy Items:", user.pluggyItems);
        console.log("Transactions Count:", user.transactions.length);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
