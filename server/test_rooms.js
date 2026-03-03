const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const checkIn = '2026-03-02';
        const checkOut = '2026-03-04';
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        const bookedRooms = await prisma.booking.findMany({
            where: {
                status: { notIn: ['cancelled'] },
                OR: [
                    { checkIn: { lt: checkOutDate }, checkOut: { gt: checkInDate } }
                ]
            },
            select: { roomId: true }
        });

        const bookedRoomIds = bookedRooms.map(b => b.roomId);
        const availabilityFilter = { id: { notIn: bookedRoomIds } };

        const rooms = await prisma.room.findMany({
            where: {
                status: 'available',
                ...availabilityFilter
            },
            orderBy: { price: 'asc' }
        });

        console.log('Found rooms:', rooms.length);
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        prisma.$disconnect();
    }
}
run();
