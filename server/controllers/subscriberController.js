const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if already subscribed
        const existing = await prisma.subscriber.findUnique({
            where: { email }
        });

        if (existing) {
            if (existing.status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'You are already subscribed to our newsletter.'
                });
            } else {
                // Re-activate subscription
                const updated = await prisma.subscriber.update({
                    where: { email },
                    data: { status: 'active' }
                });
                return res.json({
                    success: true,
                    message: 'Welcome back! Your subscription has been reactivated.',
                    data: updated
                });
            }
        }

        const subscriber = await prisma.subscriber.create({
            data: { email }
        });

        res.status(201).json({
            success: true,
            message: 'Thank you for subscribing to our VIP newsletter!',
            data: subscriber
        });
    } catch (error) {
        console.error('Newsletter Subscribe Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while subscribing. Please try again.'
        });
    }
};

// @desc    Get all subscribers
// @route   GET /api/subscribers
// @access  Private/Admin
exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await prisma.subscriber.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: subscribers
        });
    } catch (error) {
        console.error('Get Subscribers Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscribers'
        });
    }
};

// @desc    Unsubscribe email
// @route   PATCH /api/subscribers/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required to unsubscribe'
            });
        }

        const subscriber = await prisma.subscriber.findUnique({
            where: { email }
        });

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Email not found in our subscriber list'
            });
        }

        const updated = await prisma.subscriber.update({
            where: { email },
            data: { status: 'unsubscribed' }
        });

        res.json({
            success: true,
            message: 'You have been unsubscribed from our newsletter.',
            data: updated
        });
    } catch (error) {
        console.error('Unsubscribe Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe'
        });
    }
};
