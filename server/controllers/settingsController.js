const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

const getSettings = async (req, res) => {
    try {
        const { category } = req.query;
        const where = category ? { category } : {};
        const settings = await prisma.setting.findMany({ where });
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSetting = async (req, res) => {
    try {
        const { key, value, category } = req.body;
        const setting = await prisma.setting.upsert({
            where: { key },
            update: { value, category },
            create: { key, value, category }
        });
        res.json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── SMTP helpers ──────────────────────────────────────────────────────────────

const loadSmtpConfig = async () => {
    const keys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
    const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
    const db = Object.fromEntries(rows.map(r => [r.key, r.value]));
    return {
        host: db.SMTP_HOST || process.env.SMTP_HOST || '',
        port: parseInt(db.SMTP_PORT || process.env.SMTP_PORT || '587'),
        user: db.SMTP_USER || process.env.SMTP_USER || '',
        pass: db.SMTP_PASS || process.env.SMTP_PASS || '',
        from: db.SMTP_FROM || process.env.SMTP_FROM || db.SMTP_USER || process.env.SMTP_USER || '',
    };
};

const getSmtpSettings = async (req, res) => {
    try {
        const cfg = await loadSmtpConfig();
        res.json({
            success: true,
            data: {
                host: cfg.host,
                port: cfg.port,
                user: cfg.user,
                pass: cfg.pass ? '••••••••' : '',
                from: cfg.from,
                hasPassword: !!cfg.pass,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const saveSmtpSettings = async (req, res) => {
    try {
        const { host, port, user, pass, from } = req.body;
        const updates = [
            { key: 'SMTP_HOST', value: host || '' },
            { key: 'SMTP_PORT', value: String(port || 587) },
            { key: 'SMTP_USER', value: user || '' },
            { key: 'SMTP_FROM', value: from || user || '' },
        ];
        if (pass && pass !== '••••••••') {
            updates.push({ key: 'SMTP_PASS', value: pass });
        }
        for (const { key, value } of updates) {
            await prisma.setting.upsert({
                where: { key },
                update: { value, category: 'email' },
                create: { key, value, category: 'email' },
            });
        }
        res.json({ success: true, message: 'SMTP settings saved successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const testSmtpSettings = async (req, res) => {
    const { testEmail } = req.body;
    if (!testEmail) {
        return res.status(400).json({ success: false, message: 'Test email address is required.' });
    }
    try {
        const cfg = await loadSmtpConfig();
        if (!cfg.host || !cfg.user || !cfg.pass) {
            return res.status(400).json({ success: false, message: 'SMTP settings incomplete. Please save host, username and password first.' });
        }
        const transporter = nodemailer.createTransport({
            host: cfg.host,
            port: cfg.port,
            secure: cfg.port === 465,
            auth: { user: cfg.user, pass: cfg.pass },
        });
        await transporter.verify();
        await transporter.sendMail({
            from: `"Norden Suites" <${cfg.from || cfg.user}>`,
            to: testEmail,
            subject: 'Norden Suites – SMTP Test Email',
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
                <div style="background:#1a1a1a;padding:24px;text-align:center">
                  <h2 style="color:#d4af37;margin:0">NORDEN SUITES</h2>
                  <p style="color:#9ca3af;font-size:13px;margin:4px 0 0">Nyali Beach, Mombasa</p>
                </div>
                <div style="padding:32px 24px">
                  <h3 style="color:#111;margin-top:0">✅ SMTP Test Successful</h3>
                  <p style="color:#4b5563">Your email configuration is working. Booking confirmations will be delivered to guests.</p>
                  <p style="color:#9ca3af;font-size:12px">Sent at: ${new Date().toLocaleString()}</p>
                </div>
                <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af">
                  Developed by | <a href="https://kkdes.co.ke/" style="color:#d4af37">KKDES</a>
                </div>
              </div>`,
        });
        res.json({ success: true, message: `Test email sent to ${testEmail}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getSettings, updateSetting, getSmtpSettings, saveSmtpSettings, testSmtpSettings, loadSmtpConfig };
