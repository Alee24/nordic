const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createMessage = async (req, res) => {
    try {
        const { guest_name, guest_email, name, email, subject, message } = req.body;
        const newMessage = await prisma.message.create({
            data: {
                name: guest_name || name || 'Guest',
                email: guest_email || email || '',
                subject: subject || null,
                message: message || '',
            }
        });

        // Fire-and-forget email notification
        try {
            const { sendContactNotification } = require('../services/emailService');
            sendContactNotification(newMessage).catch(err =>
                console.error('Contact notification email error:', err)
            );
        } catch (_) { /* email service optional */ }

        res.json({ success: true, data: newMessage });
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};
        const messages = await prisma.message.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['unread', 'read', 'replied', 'archived'];
        if (status && !allowed.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
        }
        const updated = await prisma.message.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.message.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createMessage, getMessages, updateMessage, deleteMessage };
