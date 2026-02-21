const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// ── M-Pesa ─────────────────────────────────────────────────────────────────

const processMPesa = async (req, res) => {
    try {
        const { booking_id, amount, phone_number } = req.body;

        // Load credentials from DB
        const keys = ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_SHORTCODE', 'MPESA_PASSKEY', 'MPESA_ENV'];
        const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
        const cfg = Object.fromEntries(rows.map(r => [r.key, r.value]));

        const env = cfg.MPESA_ENV === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke';
        const auth = Buffer.from(`${cfg.MPESA_CONSUMER_KEY}:${cfg.MPESA_CONSUMER_SECRET}`).toString('base64');

        // Get OAuth token
        const tokenRes = await axios.get(`https://${env}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: { Authorization: `Basic ${auth}` }
        });
        const accessToken = tokenRes.data.access_token;

        // Build STK Push
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${cfg.MPESA_SHORTCODE}${cfg.MPESA_PASSKEY}${timestamp}`).toString('base64');

        const stkRes = await axios.post(`https://${env}/mpesa/stkpush/v1/processrequest`, {
            BusinessShortCode: cfg.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.ceil(amount),
            PartyA: phone_number,
            PartyB: cfg.MPESA_SHORTCODE,
            PhoneNumber: phone_number,
            CallBackURL: `${process.env.SITE_URL || 'https://nordensuites.com'}/api/payment/mpesa/callback`,
            AccountReference: `Booking-${booking_id}`,
            TransactionDesc: `Norden Suites Booking #${booking_id}`,
        }, { headers: { Authorization: `Bearer ${accessToken}` } });

        res.json({ success: true, data: stkRes.data, message: 'STK Push sent. Check your phone to complete payment.' });
    } catch (error) {
        console.error('M-Pesa STK Push error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: error.response?.data?.errorMessage || error.message });
    }
};

const testMPesa = async (req, res) => {
    try {
        const { consumer_key, consumer_secret, env: envName } = req.body;
        if (!consumer_key || !consumer_secret) {
            return res.status(400).json({ success: false, message: 'consumer_key and consumer_secret are required' });
        }
        const env = envName === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke';
        const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');
        const tokenRes = await axios.get(`https://${env}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: { Authorization: `Basic ${auth}` }
        });
        res.json({ success: true, message: 'OAuth token received', token: tokenRes.data.access_token?.slice(0, 10) + '...' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.response?.data?.errorMessage || 'Invalid credentials' });
    }
};

const mpesaCallback = async (req, res) => {
    try {
        const result = req.body?.Body?.stkCallback;
        console.log('M-Pesa Callback:', JSON.stringify(result, null, 2));
        // Update booking payment status if successful
        if (result?.ResultCode === 0) {
            const meta = result.CallbackMetadata?.Item;
            if (meta) {
                const ref = meta.find(i => i.Name === 'AccountReference')?.Value;
                const bookingId = ref?.replace('Booking-', '');
                if (bookingId) {
                    await prisma.booking.update({
                        where: { id: parseInt(bookingId) },
                        data: { paymentStatus: 'paid' }
                    }).catch(e => console.error('Booking update after mpesa:', e));
                }
            }
        }
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
        console.error('M-Pesa callback error:', error);
        res.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // always ack
    }
};

// ── PayPal ─────────────────────────────────────────────────────────────────

const getPaypalToken = async (clientId, clientSecret, env) => {
    const base = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await axios.post(`${base}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return { token: res.data.access_token, base };
};

const processPaypal = async (req, res) => {
    try {
        const { booking_id, amount, currency = 'USD' } = req.body;

        const keys = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_ENV'];
        const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
        const cfg = Object.fromEntries(rows.map(r => [r.key, r.value]));

        const { token, base } = await getPaypalToken(cfg.PAYPAL_CLIENT_ID, cfg.PAYPAL_CLIENT_SECRET, cfg.PAYPAL_ENV);

        const orderRes = await axios.post(`${base}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: `booking-${booking_id}`,
                amount: { currency_code: currency, value: Number(amount).toFixed(2) },
                description: `Norden Suites Booking #${booking_id}`
            }],
            application_context: {
                return_url: `${process.env.SITE_URL || 'https://nordensuites.com'}/api/payment/paypal/capture`,
                cancel_url: `${process.env.SITE_URL || 'https://nordensuites.com'}/booking`,
            }
        }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });

        const approveLink = orderRes.data.links?.find(l => l.rel === 'approve')?.href;
        res.json({ success: true, data: { approveUrl: approveLink, orderId: orderRes.data.id } });
    } catch (error) {
        console.error('PayPal error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
    }
};

const testPaypal = async (req, res) => {
    try {
        const { client_id, client_secret, env } = req.body;
        if (!client_id || !client_secret) {
            return res.status(400).json({ success: false, message: 'client_id and client_secret are required' });
        }
        await getPaypalToken(client_id, client_secret, env || 'sandbox');
        res.json({ success: true, message: 'PayPal access token received successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.response?.data?.error_description || 'Invalid credentials' });
    }
};

const processStripe = async (req, res) => {
    res.json({ success: false, message: 'Stripe not configured yet. Use M-Pesa or PayPal.' });
};

module.exports = { processMPesa, testMPesa, mpesaCallback, processPaypal, testPaypal, processStripe };
