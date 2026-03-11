// ─────────────────────────────────────────────
// Norden Suites — Database Seed
// Seeds exactly 5 suites as shown in the screenshot.
// Run with:  node server/prisma/seed.js
// ─────────────────────────────────────────────
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rooms = [
    {
        name: '1 Bedroom City View',
        type: 'City View',
        price: 12000,
        status: 'available',
        description: 'A sophisticated one-bedroom suite with stunning panoramic city views.',
        imageUrl: '/images/b13.jpg',
    },
    {
        name: '2 Bedrooms City View',
        type: 'City View',
        price: 15000,
        status: 'available',
        description: 'Spacious two-bedroom suite with sweeping city views.',
        imageUrl: '/images/b17.jpg',
    },
    {
        name: '1 Bedroom Sea View',
        type: 'Sea View',
        price: 13000,
        status: 'available',
        description: 'A breathtaking one-bedroom suite with unobstructed ocean views.',
        imageUrl: '/images/b14.jpg',
    },
    {
        name: '2 Bedrooms Sea View',
        type: 'Sea View',
        price: 16000,
        status: 'available',
        description: 'A grand two-bedroom sea-view suite with premium coastal finishes.',
        imageUrl: '/images/b16.jpg',
    },
    {
        name: 'Executive Suite',
        type: 'Executive',
        price: 0,
        status: 'available',
        description: 'Elite living for the modern professional.',
        imageUrl: '/images/b14.jpg',
    },
];

async function main() {
    console.log('🌱 Refreshing Norden Suites rooms to match original list...');

    // Delete all existing rooms to ensure exactly these 5 remain
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

    const count = await prisma.room.count({ where: { status: 'available' } });
    console.log(`\n✅ Done. ${count} available rooms in the database.`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
