const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Create Admin
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nordensuites.com' },
        update: {},
        create: {
            email: 'admin@nordensuites.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'admin'
        }
    });

    console.log({ admin });

    // Create Guest User
    const guest = await prisma.user.upsert({
        where: { email: 'guest@nordic.com' },
        update: {},
        create: {
            email: 'guest@nordic.com',
            password: hashedPassword,
            name: 'John Guest',
            role: 'user'
        }
    });

    console.log({ guest });

    // Create Rooms
    const roomTypes = ['Deluxe', 'Executive', 'Suite'];
    const roomNames = ['Seaside', 'Mountain', 'City View', 'Garden', 'Penthouse'];

    for (let i = 0; i < 10; i++) {
        const roomName = `${roomNames[i % roomNames.length]} ${i + 1}`;
        const room = await prisma.room.create({
            data: {
                name: roomName,
                type: roomTypes[i % roomTypes.length],
                price: 150 + (i * 20),
                status: 'available',
                description: `A beautiful ${roomTypes[i % roomTypes.length]} room with a view.`
            }
        });
        console.log(`Created room: ${room.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
