const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');
const { sendEmail } = require('../services/emailService');

// ── Shared helpers ──────────────────────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

const buildInvoiceHTML = (booking) => {
  const guestName =
    booking.guestName ||
    (booking.user ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() : 'Guest') ||
    'Guest';
  const guestEmail = booking.guestEmail || booking.user?.email || '';
  const guestPhone = booking.guestPhone || booking.user?.phone || 'Not provided';
  const roomName = booking.room?.name || 'Suite';
  const checkIn = fmtDate(booking.checkIn);
  const checkOut = fmtDate(booking.checkOut);
  const nights =
    booking.checkIn && booking.checkOut
      ? Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)))
      : 1;
  const perNight = Number(booking.room?.price || 0);
  const total = Number(booking.totalPrice || 0);
  const ref = booking.bookingReference || booking.reference || booking.id;
  const issued = new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });
  const year = new Date().getFullYear();
  const statusClass =
    booking.status === 'confirmed' || booking.status === 'checked_out'
      ? 'badge-green'
      : booking.status === 'pending'
        ? 'badge-yellow'
        : 'badge-red';
  const payClass = booking.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice ${ref} – Norden Suites</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;background:#f8f9fa;color:#1a1a2e;padding:40px}
  .page{max-width:760px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,.08)}
  .header{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:40px;display:flex;justify-content:space-between;align-items:center}
  .brand{font-size:26px;font-weight:900;letter-spacing:-0.5px}
  .brand-sub{font-size:12px;opacity:.7;margin-top:4px;letter-spacing:.06em;text-transform:uppercase}
  .inv-label{text-align:right}
  .inv-label h2{font-size:22px;font-weight:900}
  .inv-label p{font-size:12px;opacity:.75;margin-top:4px}
  .body{padding:40px}
  .ref-badge{display:inline-block;background:#eef2ff;color:#3730a3;border-radius:20px;padding:4px 16px;font-size:12px;font-weight:700;margin-bottom:24px;letter-spacing:.06em}
  .section{margin-bottom:28px}
  .section h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#6b7280;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f0f0f0}
  .row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .row .label{font-size:13px;color:#6b7280}
  .row .value{font-size:13px;font-weight:600;color:#111827}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th{background:#f9fafb;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;padding:10px 14px;text-align:left;border-bottom:2px solid #e5e7eb}
  td{padding:14px;font-size:13px;border-bottom:1px solid #f3f4f6;color:#374151}
  .total-row td{font-weight:700;font-size:15px;color:#1e3a5f;border-bottom:none;border-top:2px solid #e5e7eb}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
  .badge-green{background:#dcfce7;color:#166534}
  .badge-yellow{background:#fef9c3;color:#92400e}
  .badge-red{background:#fee2e2;color:#991b1b}
  .footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;display:flex;justify-content:space-between;align-items:center}
  .footer-brand{font-size:12px;color:#9ca3af}
  .footer-brand a{color:#2563eb;text-decoration:none;font-weight:600}
  .print-btn{display:block;margin:24px auto 0;background:#2563eb;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit}
  @media print{body{background:#fff;padding:0}.page{box-shadow:none;border-radius:0}.no-print{display:none}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand">NORDEN SUITES</div>
      <div class="brand-sub">Coastal Luxury Accommodation</div>
    </div>
    <div class="inv-label">
      <h2>INVOICE</h2>
      <p>Issued: ${issued}</p>
    </div>
  </div>
  <div class="body">
    <div class="ref-badge">REF: ${ref}</div>
    <div style="display:flex;gap:40px;margin-bottom:30px">
      <div class="section" style="flex:1">
        <h3>Billed To</h3>
        <div class="row"><span class="label">Name</span><span class="value">${guestName}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${guestEmail || '—'}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${guestPhone}</span></div>
      </div>
      <div class="section" style="flex:1">
        <h3>Booking Status</h3>
        <div class="row"><span class="label">Status</span>
          <span class="badge ${statusClass}">${(booking.status || 'pending').replace('_', ' ').toUpperCase()}</span>
        </div>
        <div class="row"><span class="label">Payment</span>
          <span class="badge ${payClass}">${(booking.paymentStatus || 'pending').toUpperCase()}</span>
        </div>
      </div>
    </div>
    <div class="section">
      <h3>Reservation Details</h3>
      <table>
        <thead><tr><th>Suite / Room</th><th>Check-in</th><th>Check-out</th><th>Nights</th><th>Rate/night</th><th>Total</th></tr></thead>
        <tbody>
          <tr>
            <td>${roomName}</td>
            <td>${checkIn}</td>
            <td>${checkOut}</td>
            <td>${nights}</td>
            <td>KES ${fmt(perNight)}</td>
            <td>KES ${fmt(perNight * nights)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="5" style="text-align:right">TOTAL AMOUNT</td>
            <td>KES ${fmt(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="background:#f0f9ff;border-radius:12px;padding:20px;margin-top:20px">
      <p style="font-size:12px;color:#0369a1;line-height:1.6">Thank you for choosing Norden Suites. For any queries regarding this invoice, please contact us at <a href="mailto:info@nordensuites.com">info@nordensuites.com</a></p>
    </div>
    <div class="no-print">
      <button class="print-btn" onclick="window.print()">🖨 Print / Save as PDF</button>
    </div>
  </div>
  <div class="footer">
    <div class="footer-brand">Norden Suites &copy; ${year}</div>
    <div class="footer-brand">Developed by <a href="https://kkdes.co.ke/" target="_blank">KKDES</a></div>
  </div>
</div>
</body>
</html>`;
};

// ── GET /api/bookings/:id/invoice  — View/Print HTML invoice ────────────────
router.get('/:id/invoice', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid booking ID' });

    const booking = await prisma.booking.findUnique({ where: { id }, include: { room: true, user: true } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const html = buildInvoiceHTML(booking);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${booking.bookingReference || id}.html"`);
    res.send(html);
  } catch (error) {
    console.error('Invoice HTML error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/bookings/:id/invoice/pdf  — Download as real PDF ───────────────
router.get('/:id/invoice/pdf', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid booking ID' });

    const booking = await prisma.booking.findUnique({ where: { id }, include: { room: true, user: true } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const html = buildInvoiceHTML(booking);

    // Generate PDF with puppeteer
    const puppeteer = require('puppeteer-core');
    let chromium;
    try { chromium = require('@sparticuz/chromium'); } catch (e) { chromium = null; }

    let browser;
    if (chromium) {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      // Fallback: try to find local Chrome
      const executablePath =
        process.env.CHROME_PATH ||
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
    });
    await browser.close();

    const ref = booking.bookingReference || id;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="NordenSuites-Invoice-${ref}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Invoice PDF error:', error);
    res.status(500).json({ success: false, message: 'PDF generation failed: ' + error.message });
  }
});

// ── POST /api/bookings/:id/invoice/send  — Email invoice to guest ────────────
router.post('/:id/invoice/send', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid booking ID' });

    const booking = await prisma.booking.findUnique({ where: { id }, include: { room: true, user: true } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const guestEmail = booking.guestEmail || booking.user?.email;
    if (!guestEmail) {
      return res.status(400).json({ success: false, message: 'No guest email address found for this booking.' });
    }

    const guestName =
      booking.guestName ||
      (booking.user ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() : 'Guest') ||
      'Valued Guest';
    const roomName = booking.room?.name || 'Luxury Suite';
    const ref = booking.bookingReference || booking.reference || booking.id;
    const checkIn = fmtDate(booking.checkIn);
    const checkOut = fmtDate(booking.checkOut);
    const total = Number(booking.totalPrice || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });

    const subject = `🧾 Your Invoice – Norden Suites | Ref: ${ref}`;
    const invoiceHTML = buildInvoiceHTML(booking);

    // Build a wrapping email body that embeds the invoice HTML inline
    const emailBody = `
<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto">
  <div style="background:#1e3a5f;padding:28px 32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:900;letter-spacing:-0.5px">NORDEN SUITES</h1>
    <p style="color:#93c5fd;font-size:12px;margin:6px 0 0;letter-spacing:.08em;text-transform:uppercase">Coastal Luxury Accommodation</p>
  </div>
  <div style="background:#fff;padding:36px 32px">
    <h2 style="color:#111;font-size:18px;margin-top:0">Dear ${guestName},</h2>
    <p style="color:#374151;line-height:1.6">Please find your invoice for your reservation at <strong>Norden Suites</strong> attached below.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:10px 0;color:#6b7280">Reference</td>
        <td style="padding:10px 0;text-align:right;font-weight:700;color:#1e3a5f">${ref}</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:10px 0;color:#6b7280">Suite</td>
        <td style="padding:10px 0;text-align:right;font-weight:600;color:#111">${roomName}</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:10px 0;color:#6b7280">Check-in</td>
        <td style="padding:10px 0;text-align:right;font-weight:600;color:#111">${checkIn}</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:10px 0;color:#6b7280">Check-out</td>
        <td style="padding:10px 0;text-align:right;font-weight:600;color:#111">${checkOut}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;font-weight:700">Total Amount</td>
        <td style="padding:10px 0;text-align:right;font-weight:900;font-size:18px;color:#2563eb">KES ${total}</td>
      </tr>
    </table>
    <p style="color:#374151;line-height:1.6;margin-top:24px">For any queries, please reply to this email or contact us at <a href="mailto:info@nordensuites.com" style="color:#2563eb">info@nordensuites.com</a>.</p>
    <p style="color:#374151">Warm regards,<br><strong>The Norden Suites Team</strong></p>
  </div>
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
    Developed by | <a href="https://kkdes.co.ke/" style="color:#2563eb;text-decoration:none;font-weight:600">KKDES</a>
  </div>
</div>`;

    const result = await sendEmail(guestEmail, subject, emailBody);

    if (result.success) {
      res.json({ success: true, message: `Invoice sent to ${guestEmail}` });
    } else {
      res.status(500).json({ success: false, message: result.error || 'Failed to send email. Check SMTP settings.' });
    }
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
