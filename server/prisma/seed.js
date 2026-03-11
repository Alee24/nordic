// ─────────────────────────────────────────────
// Norden Suites — Database Seed
// Seeds exactly 3 suites as per latest requirements.
// Run with:  node server/prisma/seed.js
// ─────────────────────────────────────────────
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rooms = [
    {
        name: 'Executive Suite',
        type: 'Executive',
        price: 0,
        status: 'available',
        description: 'Elite living for the modern professional. A beautifully designed executive suite with dedicated workspace and premium comfort.',
        imageUrl: '/images/b14.jpg',
    },
    {
        name: '2 Bedroom Suite City View',
        type: 'City View',
        price: 15000,
        status: 'available',
        description: 'Spacious two-bedroom suite with sweeping city views, ideal for families or colleagues traveling together.',
        imageUrl: '/images/b17.jpg',
    },
    {
        name: '2 Bedroom Suite Sea View',
        type: 'Sea View',
        price: 16000,
        status: 'available',
        description: 'A grand two-bedroom sea-view suite with premium coastal finishes and expansive living space for an unmatched stay.',
        imageUrl: '/images/b16.jpg',
    },
];

async function main() {
    console.log('🌱 Refreshing Norden Suites rooms...');

    // Delete all existing rooms to ensure ONLY the 3 requested remain
    await prisma.room.deleteMany({});
    console.log('✔ Cleared existing rooms.');

    for (const room of rooms) {
        await prisma.room.create({ data: room });
        console.log(`✔ Created room: ${room.name}`);
    }

    // ── Create Admin User ────────────────────────────────────────────────
    console.log('\n👤 Ensuring admin user exists...');
    const adminEmail = 'admin@nordensuites.com';
    const adminPassword = 'password123';
    const bcrypt = require('bcryptjs');
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedAdminPassword,
            role: 'admin'
        },
        create: {
            email: adminEmail,
            password: hashedAdminPassword,
            name: 'Norden Admin',
            role: 'admin'
        }
    });
    console.log(`✔ Admin user ready: ${admin.email}`);

    // Also add the typo version for safety
    await prisma.user.upsert({
        where: { email: 'admin@nordensuits.com' },
        update: {
            password: hashedAdminPassword
        },
        create: {
            email: 'admin@nordensuits.com',
            password: hashedAdminPassword,
            name: 'Norden Admin (Typo Fix)',
            role: 'admin'
        }
    });

    const count = await prisma.room.count({ where: { status: 'available' } });
    console.log(`\n✅ Done. ${count} available rooms in the database.`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
