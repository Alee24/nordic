const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRooms = async (req, res) => {
    try {
        const rooms = await prisma.room.findMany();
        // Simulate "available" status if requested or overlapping check logic
        // For now, simpler:
        res.json({ success: true, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createRoom = async (req, res) => {
    try {
        const { name, type, price, description, status } = req.body;
        const room = await prisma.room.create({
            data: { name, type, price, description, status }
        });
        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getRooms, createRoom };
