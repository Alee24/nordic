const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStatistics = async (req, res) => {
    try {
        const totalBookings = await prisma.booking.count();
        const confirmedBookings = await prisma.booking.count({ where: { status: 'confirmed' } });
        const pendingBookings = await prisma.booking.count({ where: { status: 'pending' } });

        const totalRevenue = await prisma.booking.aggregate({
            _sum: { totalPrice: true },
            where: { status: 'confirmed' }
        });

        res.json({
            success: true,
            data: {
                totalBookings,
                confirmedBookings,
                pendingBookings,
                totalRevenue: totalRevenue._sum.totalPrice || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRecentBookings = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const bookings = await prisma.booking.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { room: true, user: true }
        });
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getGuests = async (req, res) => {
    try {
        const guests = await prisma.user.findMany({
            where: { role: 'user' },
            include: { bookings: true }
        });
        res.json({ success: true, data: guests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStatistics, getRecentBookings, getGuests };
