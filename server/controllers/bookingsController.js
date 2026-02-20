const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                room: true,
                user: true
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

        const booking = await prisma.booking.create({
            data: {
                userId,
                roomId: parseInt(roomId),
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                totalPrice: parseFloat(totalPrice),
                status: 'confirmed'
            },
            include: {
                room: true,
                user: true
            }
        });

        console.log('Booking created successfully:', booking.id);
        res.json({ success: true, data: booking });
    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getBookings, createBooking };
