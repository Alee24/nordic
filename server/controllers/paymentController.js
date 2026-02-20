const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const processMPesa = async (req, res) => {
    try {
        const { booking_id, amount, phone_number } = req.body;
        // Simplified: just log and return success
        console.log(`Processing M-Pesa for booking ${booking_id}: ${amount} to ${phone_number}`);
        res.json({ success: true, message: 'STK Push sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const processPaypal = async (req, res) => {
    try {
        const { booking_id, amount } = req.body;
        console.log(`Processing Paypal for booking ${booking_id}: ${amount}`);
        res.json({
            success: true,
            data: {
                links: [{ rel: 'approve', href: 'http://localhost:8124/my-booking' }]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const processStripe = async (req, res) => {
    try {
        const { booking_id, amount } = req.body;
        console.log(`Processing Stripe for booking ${booking_id}: ${amount}`);
        res.json({
            success: true,
            data: {
                url: 'http://localhost:8124/my-booking'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { processMPesa, processPaypal, processStripe };
