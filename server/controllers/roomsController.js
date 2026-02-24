const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRooms = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        // Build the availability filter if dates provided
        let availabilityFilter = {};
        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            // Get IDs of rooms that are already booked for overlapping dates
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
            availabilityFilter = { id: { notIn: bookedRoomIds } };
        }

        const rooms = await prisma.room.findMany({
            where: {
                status: 'available',
                ...availabilityFilter
            },
            orderBy: { price: 'asc' }
        });

        res.json({ success: true, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createRoom = async (req, res) => {
    try {
        const { name, type, price, description, status, imageUrl } = req.body;
        if (!name || !type || price === undefined) {
            return res.status(400).json({ success: false, message: 'name, type, and price are required' });
        }
        const room = await prisma.room.create({
            data: {
                name,
                type,
                price: parseFloat(price),
                description: description || '',
                status: status || 'available',
                imageUrl: imageUrl || null
            }
        });
        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateRoom = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, type, price, description, status, imageUrl } = req.body;
        const data = {};
        if (name !== undefined) data.name = name;
        if (type !== undefined) data.type = type;
        if (price !== undefined) data.price = parseFloat(price);
        if (description !== undefined) data.description = description;
        if (status !== undefined) data.status = status;
        if (imageUrl !== undefined) data.imageUrl = imageUrl;

        const room = await prisma.room.update({ where: { id }, data });
        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.room.delete({ where: { id } });
        res.json({ success: true, message: 'Room deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getRooms, createRoom, updateRoom, deleteRoom };
