// ─────────────────────────────────────────────
// Norden Suites — Database Seed
// Seeds the 5 suites from the 2026 Rate Card.
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
        description: 'A sophisticated one-bedroom suite with stunning panoramic city views, a fully equipped kitchen, and premium finishes throughout.',
        imageUrl: '/images/bed1.jpg',
    },
    {
        name: '2 Bedrooms City View',
        type: 'City View',
        price: 15000,
        status: 'available',
        description: 'Spacious two-bedroom suite with sweeping city views, ideal for families or colleagues traveling together.',
        imageUrl: '/images/bed2.jpg',
    },
    {
        name: '1 Bedroom Sea View',
        type: 'Sea View',
        price: 13000,
        status: 'available',
        description: 'A breathtaking one-bedroom suite with unobstructed ocean views, waking up to the sound of waves every morning.',
        imageUrl: '/images/bedview.jpeg',
    },
    {
        name: '2 Bedrooms Sea View',
        type: 'Sea View',
        price: 16000,
        status: 'available',
        description: 'A grand two-bedroom sea-view suite with premium coastal finishes and expansive living space for an unmatched stay.',
        imageUrl: '/images/b11.jpg',
    },
    {
        name: 'Penthouse',
        type: 'Penthouse',
        price: 14000,
        status: 'available',
        description: 'The crown jewel of Norden Suites — an iconic penthouse with panoramic 360° views and the finest bespoke interiors.',
        imageUrl: '/images/living67.jpg',
    },
];

async function main() {
    console.log('🌱 Seeding Norden Suites rooms...');

    for (const room of rooms) {
        const existing = await prisma.room.findFirst({ where: { name: room.name } });
        if (existing) {
            // Update to ensure status is correct
            await prisma.room.update({ where: { id: existing.id }, data: { status: 'available' } });
            console.log(`✔ Room already exists, ensured available: ${room.name}`);
        } else {
            await prisma.room.create({ data: room });
            console.log(`✔ Created room: ${room.name}`);
        }
    }

    // ── Create Admin User ────────────────────────────────────────────────
    console.log('\n👤 Ensuring admin user exists...');
    const adminEmail = 'admin@nordensuites.com';
    const adminPassword = 'password123';
    const bcrypt = require('bcryptjs');
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {}, // Don't overwrite password if it exists
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
