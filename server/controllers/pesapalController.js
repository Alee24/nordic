const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────

const getPesapalConfig = async () => {
    const keys = [
        'PESAPAL_CONSUMER_KEY',
        'PESAPAL_CONSUMER_SECRET',
        'PESAPAL_ENV',
        'PESAPAL_IPN_ID',
    ];
    const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
    const cfg = Object.fromEntries(rows.map(r => [r.key, r.value]));
    const isSandbox = (cfg.PESAPAL_ENV || 'sandbox') !== 'live';
    const baseUrl = isSandbox
        ? 'https://cybqa.pesapal.com/pesapalv3'
        : 'https://pay.pesapal.com/v3';
    return { ...cfg, baseUrl, isSandbox };
};

/** Get a fresh Bearer token (valid 5 min). */
const getPesapalToken = async (consumerKey, consumerSecret, baseUrl) => {
    const resp = await axios.post(
        `${baseUrl}/api/Auth/RequestToken`,
        { consumer_key: consumerKey, consumer_secret: consumerSecret },
        { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
    );
    if (resp.data?.error) {
        throw new Error(resp.data.error.message || 'PesaPal auth failed');
    }
    return resp.data.token;
};

// ── Register IPN URL ──────────────────────────────────────────────────────────
/**
 * POST /api/payment/pesapal/register-ipn
 * Registers the IPN URL with PesaPal and stores the returned ipn_id in Settings.
 * This should be called once (or after changing the server URL).
 */
const registerIpn = async (req, res) => {
    try {
        const cfg = await getPesapalConfig();
        if (!cfg.PESAPAL_CONSUMER_KEY || !cfg.PESAPAL_CONSUMER_SECRET) {
            return res.status(400).json({ success: false, message: 'PesaPal credentials not configured. Save them in Payment Settings first.' });
        }

        const token = await getPesapalToken(cfg.PESAPAL_CONSUMER_KEY, cfg.PESAPAL_CONSUMER_SECRET, cfg.baseUrl);
        const siteUrl = process.env.SITE_URL || 'https://nordensuites.com';
        const ipnUrl = `${siteUrl}/api/payment/pesapal/ipn`;

        const resp = await axios.post(
            `${cfg.baseUrl}/api/URLSetup/RegisterIPN`,
            { url: ipnUrl, ipn_notification_type: 'GET' },
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (resp.data?.error) throw new Error(resp.data.error.message);

        const ipnId = resp.data.ipn_id;
        // Persist the IPN ID so we can use it for all future orders
        await prisma.setting.upsert({
            where: { key: 'PESAPAL_IPN_ID' },
            update: { value: ipnId, category: 'payment' },
            create: { key: 'PESAPAL_IPN_ID', value: ipnId, category: 'payment' },
        });

        res.json({ success: true, message: 'IPN URL registered successfully.', ipn_id: ipnId, ipn_url: ipnUrl });
    } catch (error) {
        console.error('PesaPal IPN registration error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: error.response?.data?.error?.message || error.message });
    }
};

// ── Submit Order (initiate payment) ─────────────────────────────────────────
/**
 * POST /api/payment/pesapal
 * Body: { booking_id, amount, currency?, guest_name?, guest_email?, guest_phone? }
 * Returns { redirect_url, order_tracking_id }
 */
const processPesapal = async (req, res) => {
    try {
        const {
            booking_id,
            amount,
            currency = 'KES',
            guest_name = '',
            guest_email = '',
            guest_phone = '',
        } = req.body;

        if (!booking_id || !amount) {
            return res.status(400).json({ success: false, message: 'booking_id and amount are required.' });
        }

        const cfg = await getPesapalConfig();
        if (!cfg.PESAPAL_CONSUMER_KEY || !cfg.PESAPAL_CONSUMER_SECRET) {
            return res.status(400).json({ success: false, message: 'PesaPal is not configured. Please add credentials in Payment Settings.' });
        }
        if (!cfg.PESAPAL_IPN_ID) {
            return res.status(400).json({ success: false, message: 'PesaPal IPN not registered. Please register the IPN URL in Payment Settings first.' });
        }

        const token = await getPesapalToken(cfg.PESAPAL_CONSUMER_KEY, cfg.PESAPAL_CONSUMER_SECRET, cfg.baseUrl);
        const siteUrl = process.env.SITE_URL || 'https://nordensuites.com';

        // Split full name into first/last
        const nameParts = guest_name.trim().split(' ');
        const firstName = nameParts[0] || 'Guest';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        const payload = {
            id: `NORDEN-${booking_id}-${Date.now()}`,
            currency,
            amount: Number(amount),
            description: `Norden Suites Booking #${booking_id}`,
            callback_url: `${siteUrl}/payment/pesapal/success?booking_id=${booking_id}`,
            redirect_mode: '',
            notification_id: cfg.PESAPAL_IPN_ID,
            branch: 'Norden Suites — Nyali Beach',
            billing_address: {
                email_address: guest_email || 'guest@nordensuites.com',
                phone_number: guest_phone || '',
                country_code: 'KE',
                first_name: firstName,
                last_name: lastName,
                line_1: 'Norden Suites, Nyali',
            },
        };

        const resp = await axios.post(
            `${cfg.baseUrl}/api/Transactions/SubmitOrderRequest`,
            payload,
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (resp.data?.error) throw new Error(resp.data.error.message);

        // Store tracking ID on the booking for later status checks
        const trackingId = resp.data.order_tracking_id;
        await prisma.booking.update({
            where: { id: parseInt(booking_id) },
            data: { paymentStatus: 'pending' },
        }).catch(e => console.warn('Could not update booking status:', e.message));

        res.json({
            success: true,
            redirect_url: resp.data.redirect_url,
            order_tracking_id: trackingId,
            merchant_reference: resp.data.merchant_reference,
        });
    } catch (error) {
        console.error('PesaPal order error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: error.response?.data?.error?.message || error.message });
    }
};

// ── IPN Callback (PesaPal calls this after payment) ─────────────────────────
/**
 * GET /api/payment/pesapal/ipn?orderTrackingId=...&orderMerchantReference=...&orderNotificationType=...
 * PesaPal sends a GET request here. We query the transaction status and update the booking.
 */
const pesapalIpn = async (req, res) => {
    try {
        const { orderTrackingId, orderMerchantReference } = req.query;
        console.log('PesaPal IPN received:', req.query);

        if (!orderTrackingId) {
            return res.status(400).json({ success: false, message: 'orderTrackingId missing' });
        }

        const cfg = await getPesapalConfig();
        const token = await getPesapalToken(cfg.PESAPAL_CONSUMER_KEY, cfg.PESAPAL_CONSUMER_SECRET, cfg.baseUrl);

        // Query transaction status
        const statusResp = await axios.get(
            `${cfg.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const statusData = statusResp.data;
        console.log('PesaPal transaction status:', statusData);

        // payment_status_description: 'Completed', 'Failed', 'Invalid', 'Reversed', 'Pending'
        const paymentDone = statusData.payment_status_description === 'Completed';

        // Extract booking ID from merchant_reference: "NORDEN-{booking_id}-{timestamp}"
        if (orderMerchantReference) {
            const parts = orderMerchantReference.split('-');
            const bookingId = parts[1] ? parseInt(parts[1]) : null;
            if (bookingId) {
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        paymentStatus: paymentDone ? 'paid' : 'failed',
                    },
                }).catch(e => console.warn('IPN booking update failed:', e.message));
            }
        }

        // PesaPal expects a 200 OK
        res.status(200).json({ orderNotificationType: 'IPNCHANGE', orderTrackingId, orderMerchantReference, status: 200 });
    } catch (error) {
        console.error('PesaPal IPN error:', error.response?.data || error.message);
        res.status(200).json({ status: 200 }); // Always 200 to acknowledge
    }
};

// ── Get Transaction Status ───────────────────────────────────────────────────
/**
 * GET /api/payment/pesapal/status?orderTrackingId=...
 */
const getTransactionStatus = async (req, res) => {
    try {
        const { orderTrackingId } = req.query;
        if (!orderTrackingId) {
            return res.status(400).json({ success: false, message: 'orderTrackingId is required' });
        }
        const cfg = await getPesapalConfig();
        const token = await getPesapalToken(cfg.PESAPAL_CONSUMER_KEY, cfg.PESAPAL_CONSUMER_SECRET, cfg.baseUrl);
        const resp = await axios.get(
            `${cfg.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        res.json({ success: true, data: resp.data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.response?.data?.error?.message || error.message });
    }
};

// ── Test Connection ───────────────────────────────────────────────────────────
/**
 * POST /api/payment/pesapal/test
 * Body: { consumer_key, consumer_secret, env }
 */
const testPesapal = async (req, res) => {
    try {
        const { consumer_key, consumer_secret, env = 'sandbox' } = req.body;
        if (!consumer_key || !consumer_secret) {
            return res.status(400).json({ success: false, message: 'consumer_key and consumer_secret are required.' });
        }
        const baseUrl = env === 'live'
            ? 'https://pay.pesapal.com/v3'
            : 'https://cybqa.pesapal.com/pesapalv3';

        const token = await getPesapalToken(consumer_key, consumer_secret, baseUrl);
        res.json({ success: true, message: 'PesaPal auth token received successfully.', token: token.slice(0, 20) + '...' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.response?.data?.error?.message || 'Invalid credentials or PesaPal unreachable.' });
    }
};

// ── Save PesaPal Settings ─────────────────────────────────────────────────────
/**
 * POST /api/settings/pesapal
 */
const savePesapalSettings = async (req, res) => {
    try {
        const { consumer_key, consumer_secret, env, enabled } = req.body;
        const updates = [
            { key: 'PESAPAL_CONSUMER_KEY', value: consumer_key || '' },
            { key: 'PESAPAL_CONSUMER_SECRET', value: consumer_secret || '' },
            { key: 'PESAPAL_ENV', value: env || 'sandbox' },
            { key: 'PESAPAL_ENABLED', value: String(enabled ?? false) },
        ];
        for (const { key, value } of updates) {
            await prisma.setting.upsert({
                where: { key },
                update: { value, category: 'payment' },
                create: { key, value, category: 'payment' },
            });
        }
        res.json({ success: true, message: 'PesaPal settings saved successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/settings/pesapal
 */
const getPesapalSettings = async (req, res) => {
    try {
        const keys = ['PESAPAL_CONSUMER_KEY', 'PESAPAL_CONSUMER_SECRET', 'PESAPAL_ENV', 'PESAPAL_ENABLED', 'PESAPAL_IPN_ID'];
        const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
        const cfg = Object.fromEntries(rows.map(r => [r.key, r.value]));
        res.json({
            success: true,
            data: {
                consumer_key: cfg.PESAPAL_CONSUMER_KEY || '',
                consumer_secret: cfg.PESAPAL_CONSUMER_SECRET ? '••••••••' : '',
                hasSecret: !!cfg.PESAPAL_CONSUMER_SECRET,
                env: cfg.PESAPAL_ENV || 'sandbox',
                enabled: cfg.PESAPAL_ENABLED === 'true',
                ipn_id: cfg.PESAPAL_IPN_ID || '',
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerIpn,
    processPesapal,
    pesapalIpn,
    getTransactionStatus,
    testPesapal,
    savePesapalSettings,
    getPesapalSettings,
};
