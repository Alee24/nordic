const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // ── Admin User ──────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('Admin@Norden2024', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nordensuites.com' },
        update: { password: hashedPassword, role: 'ADMIN' },
        create: {
            email: 'admin@nordensuites.com',
            password: hashedPassword,
            name: 'Super Admin',
            role: 'ADMIN'
        }
    });
    console.log('✅ Admin:', admin.email);

    // ── 5 Exact room types matching the booking table ───────────────────────
    const roomsData = [
        {
            name: '1 Bedroom City View',
            type: 'Luxury Suite',
            price: 12000,
            status: 'available',
            description: 'A beautifully appointed one-bedroom apartment with sweeping city views. Perfect for solo travellers or couples seeking urban luxury.',
            imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop'
        },
        {
            name: '2 Bedrooms City View',
            type: 'Luxury Suite',
            price: 15000,
            status: 'available',
            description: 'Spacious two-bedroom residence with panoramic city views. Ideal for families or groups wanting the comforts of home with 5-star service.',
            imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop'
        },
        {
            name: '1 Bedroom Sea View',
            type: 'Luxury Suite',
            price: 13000,
            status: 'available',
            description: 'Wake up to the Indian Ocean from this stunning one-bedroom retreat. Enjoy direct ocean views and the sound of the waves from your private balcony.',
            imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop'
        },
        {
            name: '2 Bedrooms Sea View',
            type: 'Luxury Suite',
            price: 16000,
            status: 'available',
            description: 'Our premium two-bedroom sea-facing residence. An unrivalled coastal living experience with breathtaking views of the Nyali coastline.',
            imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop'
        },
        {
            name: 'Penthouse',
            type: 'Luxury Suite',
            price: 24000,
            status: 'available',
            description: 'The crown jewel of Norden Suites. This rooftop penthouse offers 360° views of the ocean and city, a private terrace, and bespoke concierge service.',
            imageUrl: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&auto=format&fit=crop'
        }
    ];

    for (const roomData of roomsData) {
        const existing = await prisma.room.findFirst({ where: { name: roomData.name } });
        if (existing) {
            await prisma.room.update({ where: { id: existing.id }, data: roomData });
            console.log(`✅ Updated: ${roomData.name}`);
        } else {
            await prisma.room.create({ data: roomData });
            console.log(`✅ Created: ${roomData.name}`);
        }
    }

    console.log('\n🏨 Norden Suites seed complete!');
    console.log('────────────────────────────────');
    console.log('Admin Login: admin@nordensuites.com');
    console.log('Password:    Admin@Norden2024');
    console.log('────────────────────────────────');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
