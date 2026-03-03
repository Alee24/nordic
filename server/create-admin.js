const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@nordensuites.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'admin'
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Norden Admin',
            role: 'admin'
        }
    });

    console.log(`✅ Admin user ${user.email} created/updated successfully.`);
}

main()
    .catch(e => {
        console.error('❌ Error creating admin:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
