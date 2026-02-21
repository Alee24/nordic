const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStatistics = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        // Booking counts
        const [totalBookings, confirmedBookings, pendingBookings, cancelledBookings] = await Promise.all([
            prisma.booking.count(),
            prisma.booking.count({ where: { status: 'confirmed' } }),
            prisma.booking.count({ where: { status: 'pending' } }),
            prisma.booking.count({ where: { status: 'cancelled' } }),
        ]);

        // Revenue: total confirmed + this month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalRevenueResult, monthlyRevenueResult] = await Promise.all([
            prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ['confirmed', 'checked_out'] } } }),
            prisma.booking.aggregate({
                _sum: { totalPrice: true },
                where: { status: { in: ['confirmed', 'checked_out'] }, createdAt: { gte: monthStart } }
            }),
        ]);

        // Today's operations
        const [todayArrivals, todayDepartures] = await Promise.all([
            prisma.booking.count({ where: { checkIn: { gte: todayStart, lt: todayEnd } } }),
            prisma.booking.count({ where: { checkOut: { gte: todayStart, lt: todayEnd } } }),
        ]);

        // Rooms
        const [totalRooms, availableRooms, maintenanceRooms] = await Promise.all([
            prisma.room.count(),
            prisma.room.count({ where: { status: 'available' } }),
            prisma.room.count({ where: { status: 'maintenance' } }),
        ]);

        // Unique guests (users with at least one booking)
        const totalGuests = await prisma.booking.groupBy({
            by: ['guestName'],
            _count: true,
        }).then(g => g.length);

        const occupiedRooms = totalRooms - availableRooms - maintenanceRooms;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        res.json({
            success: true,
            data: {
                // Booking stats
                totalBookings,
                confirmedBookings,
                pendingBookings,
                cancelledBookings,
                // Revenue
                totalRevenue: totalRevenueResult._sum.totalPrice || 0,
                monthlyRevenue: monthlyRevenueResult._sum.totalPrice || 0,
                // Rooms
                totalRooms,
                availableRooms,
                maintenanceRooms,
                occupancyRate,
                // Today
                todayArrivals,
                todayDepartures,
                totalGuests,
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMonthlyRevenue = async (req, res) => {
    try {
        const months = 12;
        const now = new Date();
        const result = [];

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const label = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });

            const revenue = await prisma.booking.aggregate({
                _sum: { totalPrice: true },
                where: {
                    status: { in: ['confirmed', 'checked_out'] },
                    createdAt: { gte: date, lt: nextDate }
                }
            });
            const bookings = await prisma.booking.count({
                where: { createdAt: { gte: date, lt: nextDate } }
            });

            result.push({ month: label, revenue: revenue._sum.totalPrice || 0, bookings });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Monthly revenue error:', error);
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

        const mapped = bookings.map(b => ({
            id: b.id,
            booking_reference: b.bookingReference,
            guest_name: b.guestName || (b.user ? `${b.user.firstName || ''} ${b.user.lastName || ''}`.trim() : 'Guest'),
            guest_email: b.guestEmail || b.user?.email || '',
            suite_name: b.room?.name || 'Room',
            check_in: b.checkIn ? new Date(b.checkIn).toLocaleDateString('en-KE') : '-',
            check_out: b.checkOut ? new Date(b.checkOut).toLocaleDateString('en-KE') : '-',
            status: b.status,
            payment_status: b.paymentStatus || 'pending',
            total_price: b.totalPrice || 0,
            created_at: b.createdAt,
        }));

        res.json({ success: true, data: mapped });
    } catch (error) {
        console.error('Recent bookings error:', error);
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

module.exports = { getStatistics, getRecentBookings, getGuests, getMonthlyRevenue };
