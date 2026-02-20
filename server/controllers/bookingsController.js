const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                room: true,
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createBooking = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, totalPrice, guest_name, guest_email, guest_phone } = req.body;

        // Find user: use authenticated user, or find/create guest user based on email
        let userId;
        if (req.user && req.user.id) {
            userId = req.user.id;
        } else {
            // Check if user exists by email, otherwise create a guest user
            const email = guest_email || 'guest@nordic.com';
            let user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        email,
                        password: 'guest-password-placeholder',
                        name: guest_name || 'Guest User',
                        role: 'user'
                    }
                });
            }
            userId = user.id;
        }

        // Generate a random-ish reference
        const reference = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const booking = await prisma.booking.create({
            data: {
                userId,
                roomId: parseInt(roomId),
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                totalPrice: parseFloat(totalPrice),
                status: 'confirmed',
                paymentStatus: 'pending',
                reference: reference
            },
            include: {
                room: true,
                user: true
            }
        });

        try {
            const { sendBookingConfirmation } = require('../services/emailService');
            sendBookingConfirmation(booking).catch(err => console.error('Delayed email error:', err));
        } catch (e) {
            console.warn('Email service not available or failed to load:', e.message);
        }

        console.log('Booking created successfully:', booking.id, 'Ref:', reference);
        res.json({ success: true, data: booking });
    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const finalizeCheckin = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { status: 'checked_in' }
        });
        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getBookings, createBooking, updateBookingStatus, finalizeCheckin };
