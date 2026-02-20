const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createMessage = async (req, res) => {
    try {
        const { guest_name, guest_email, subject, message } = req.body;
        const newMessage = await prisma.message.create({
            data: {
                name: guest_name,
                email: guest_email,
                subject,
                message
            }
        });
        res.json({ success: true, data: newMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createMessage, getMessages };
