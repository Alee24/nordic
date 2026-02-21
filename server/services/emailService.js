const nodemailer = require('nodemailer');

// Load SMTP config from DB settings (with env var fallback)
const getSmtpConfig = async () => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const keys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
        const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
        await prisma.$disconnect();
        const db = Object.fromEntries(rows.map(r => [r.key, r.value]));
        return {
            host: db.SMTP_HOST || process.env.SMTP_HOST || '',
            port: parseInt(db.SMTP_PORT || process.env.SMTP_PORT || '587'),
            user: db.SMTP_USER || process.env.SMTP_USER || '',
            pass: db.SMTP_PASS || process.env.SMTP_PASS || '',
            from: db.SMTP_FROM || process.env.SMTP_FROM || db.SMTP_USER || process.env.SMTP_USER || '',
        };
    } catch {
        return {
            host: process.env.SMTP_HOST || '',
            port: parseInt(process.env.SMTP_PORT || '587'),
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
            from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
        };
    }
};

const sendEmail = async (to, subject, html) => {
    try {
        const cfg = await getSmtpConfig();
        if (!cfg.host || !cfg.user || !cfg.pass) {
            console.warn('SMTP not configured — skipping email to', to);
            return { success: false, error: 'SMTP not configured' };
        }
        const transporter = nodemailer.createTransport({
            host: cfg.host,
            port: cfg.port,
            secure: cfg.port === 465,
            auth: { user: cfg.user, pass: cfg.pass },
        });
        const info = await transporter.sendMail({
            from: `"Norden Suites" <${cfg.from || cfg.user}>`,
            to,
            subject,
            html,
        });
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error.message);
        return { success: false, error: error.message };
    }
};

const sendBookingConfirmation = async (booking) => {
    const guestEmail = booking.user?.email;
    const guestName = booking.user?.name || booking.guest_name || 'Valued Guest';
    const roomName = booking.room?.name || 'Luxury Suite';
    const ref = booking.reference || booking.id;
    const checkIn = new Date(booking.checkIn).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const checkOut = new Date(booking.checkOut).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const total = Number(booking.totalPrice || 0).toLocaleString();

    const subject = `✅ Booking Confirmed – ${roomName} | Ref: ${ref}`;
    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
        <div style="background:#1a1a1a;padding:32px 24px;text-align:center">
          <h1 style="color:#d4af37;margin:0;font-size:28px;letter-spacing:2px">NORDEN SUITES</h1>
          <p style="color:#9ca3af;font-size:13px;margin:6px 0 0;letter-spacing:1px">NYALI BEACH · MOMBASA</p>
        </div>

        <div style="padding:36px 32px;background:#fff">
          <h2 style="color:#111;font-size:20px;margin-top:0">Dear ${guestName},</h2>
          <p style="color:#374151;line-height:1.6">
            Thank you for choosing <strong>Norden Suites</strong>. Your reservation has been confirmed. We look forward to hosting you.
          </p>

          <div style="background:#f9f7f2;border-left:4px solid #d4af37;border-radius:6px;padding:20px 24px;margin:24px 0">
            <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase">Booking Reference</p>
            <p style="margin:0;font-size:22px;font-weight:bold;color:#d4af37">${ref}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:15px">
            <tr style="border-bottom:1px solid #e5e7eb">
              <td style="padding:12px 0;color:#6b7280">Suite</td>
              <td style="padding:12px 0;text-align:right;font-weight:600;color:#111">${roomName}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb">
              <td style="padding:12px 0;color:#6b7280">Check-in</td>
              <td style="padding:12px 0;text-align:right;font-weight:600;color:#111">${checkIn}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb">
              <td style="padding:12px 0;color:#6b7280">Check-out</td>
              <td style="padding:12px 0;text-align:right;font-weight:600;color:#111">${checkOut}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#6b7280">Total Amount</td>
              <td style="padding:12px 0;text-align:right;font-weight:700;font-size:18px;color:#d4af37">KES ${total}</td>
            </tr>
          </table>

          <p style="color:#374151;margin-top:28px;line-height:1.6">
            If you have any questions or special requests, please reply to this email or contact us at
            <a href="mailto:info@nordensuites.com" style="color:#d4af37">info@nordensuites.com</a>.
          </p>
          <p style="color:#374151">Warm regards,<br><strong>The Norden Suites Team</strong></p>
        </div>

        <div style="background:#f9fafb;padding:20px 24px;text-align:center;font-size:12px;color:#9ca3af">
          Developed by | <a href="https://kkdes.co.ke/" style="color:#d4af37;text-decoration:none">KKDES</a>
        </div>
      </div>`;

    return sendEmail(guestEmail, subject, html);
};

const sendContactNotification = async (message) => {
    const cfg = await getSmtpConfig();
    const subject = `New Inquiry: ${message.subject || 'General'}`;
    const html = `
        <h1>New Contact Inquiry</h1>
        <p><strong>From:</strong> ${message.name} (${message.email})</p>
        <p><strong>Subject:</strong> ${message.subject || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.message}</p>
        <hr />
        <footer>Developed by | KKDES "https://kkdes.co.ke/"</footer>
    `;
    return sendEmail(cfg.user, subject, html);
};

module.exports = { sendEmail, sendBookingConfirmation, sendContactNotification };
