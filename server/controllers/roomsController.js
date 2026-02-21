const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRooms = async (req, res) => {
    try {
        const rooms = await prisma.room.findMany({ orderBy: { createdAt: 'desc' } });
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
