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

const fs = require('fs');
const path = require('path');

const buildInvoiceHTML = (booking) => {
  const guestName = booking.guestName || (booking.user ? `${booking.user.name || 'Guest User'}` : 'Guest');
  const guestEmail = booking.guestEmail || booking.user?.email || '';
  const guestPhone = booking.guestPhone || booking.user?.phone || 'Not provided';
  const roomName = booking.room?.name || 'Luxury Suite';
  const checkIn = fmtDate(booking.checkIn);
  const checkOut = fmtDate(booking.checkOut);
  const nights = booking.checkIn && booking.checkOut
    ? Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)))
    : 1;
  const perNight = Number(booking.room?.price || 0);
  const total = Number(booking.totalPrice || 0);
  const ref = booking.bookingReference || booking.reference || `BK-${booking.id}`;
  const issued = new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });
  const year = new Date().getFullYear();

  // Load and base64 encode logo
  let logoBase64 = '';
  try {
    const logoPath = path.join(__dirname, '../../public/images/mlogo.png');
    if (fs.existsSync(logoPath)) {
      const bitmap = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
    }
  } catch (e) {
    console.warn('Logo loading failed:', e.message);
  }

  const statusClass = booking.status === 'confirmed' || booking.status === 'checked_out' ? 'badge-green' : 'badge-yellow';
  const payClass = booking.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${ref} – Norden Suites</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;500;600;700&display=swap');
  
  :root {
    --nordic-gold: #D4AF37;
    --nordic-dark: #1A1B1E;
    --nordic-gray: #4A4A4A;
    --nordic-light: #F8F9FA;
  }

  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: var(--nordic-dark); font-size: 14px; line-height: 1.5; }
  
  .invoice-container { max-width: 850px; margin: 0 auto; padding: 50px; }
  
  /* Header Section */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; border-bottom: 4px solid var(--nordic-gold); padding-bottom: 30px; }
  .logo-container { width: 180px; }
  .logo-container img { width: 100%; height: auto; }
  
  .company-info { text-align: right; }
  .company-name { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--nordic-dark); margin-bottom: 5px; }
  .company-details { color: var(--nordic-gray); font-size: 12px; }
  
  /* Invoice Meta */
  .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .billed-to h3, .invoice-details h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: var(--nordic-gold); font-weight: 700; margin-bottom: 15px; }
  .billed-to p { font-size: 15px; font-weight: 600; margin-bottom: 5px; }
  .billed-to span { color: var(--nordic-gray); font-size: 13px; }
  
  .invoice-details table { border-spacing: 0; }
  .invoice-details td { padding: 3px 0; font-size: 13px; }
  .invoice-details td.label { font-weight: 600; padding-right: 20px; color: var(--nordic-gray); }
  .invoice-details td.value { text-align: right; font-weight: 700; }

  /* Items Table */
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
  .items-table th { background: var(--nordic-dark); color: #fff; text-align: left; padding: 15px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  .items-table td { padding: 20px 15px; border-bottom: 1px solid #EDEDED; vertical-align: middle; }
  .items-table .item-name { font-weight: 700; font-size: 15px; display: block; }
  .items-table .item-desc { font-size: 12px; color: var(--nordic-gray); }
  
  /* Summary Section */
  .summary { display: flex; justify-content: flex-end; }
  .summary-table { width: 300px; border-spacing: 0; }
  .summary-table td { padding: 10px 0; border-bottom: 1px solid #EDEDED; }
  .summary-table tr:last-child td { border-bottom: none; }
  .summary-table .label { font-size: 13px; color: var(--nordic-gray); }
  .summary-table .value { text-align: right; font-weight: 600; }
  .summary-table .total-row td { padding-top: 20px; font-size: 20px; font-weight: 800; color: var(--nordic-dark); }
  .summary-table .total-row .value { color: var(--nordic-gold); }

  /* Status Badges */
  .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
  .badge-green { background: #E6F4EA; color: #1E8E3E; }
  .badge-yellow { background: #FEF7E0; color: #F9AB00; }

  /* Footer */
  .footer { margin-top: 80px; padding-top: 30px; border-top: 1px solid #EDEDED; display: flex; justify-content: space-between; align-items: center; }
  .footer-left { font-size: 11px; color: var(--nordic-gray); max-width: 400px; }
  .footer-right { text-align: right; font-size: 11px; color: var(--nordic-gray); }
  .footer-right a { color: var(--nordic-dark); font-weight: 700; text-decoration: none; }
  
  .print-btn { display: block; margin: 40px auto; background: var(--nordic-dark); color: #fff; border: none; padding: 15px 40px; border-radius: 5px; font-size: 14px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; }

  @media print {
    .print-btn { display: none; }
    body { background: #fff; }
    .invoice-container { padding: 20px; }
  }
</style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo-container">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Norden Suites Logo">` : '<div class="company-name">NORDEN SUITES</div>'}
      </div>
      <div class="company-info">
        <div class="company-name">Norden Suites</div>
        <div class="company-details">
          Nyali Beach, Mombasa, Kenya<br>
          info@nordensuites.com<br>
          +254 700 000 000
        </div>
      </div>
    </div>

    <div class="invoice-meta">
      <div class="billed-to">
        <h3>Billed To</h3>
        <p>${guestName}</p>
        <span>${guestEmail}</span><br>
        <span>${guestPhone}</span>
      </div>
      <div class="invoice-details">
        <h3>Invoice Details</h3>
        <table>
          <tr><td class="label">Invoice No:</td><td class="value">${ref}</td></tr>
          <tr><td class="label">Date:</td><td class="value">${issued}</td></tr>
          <tr><td class="label">Booking Status:</td><td class="value"><span class="badge ${statusClass}">${(booking.status || 'pending').replace('_', ' ').toUpperCase()}</span></td></tr>
          <tr><td class="label">Payment Status:</td><td class="value"><span class="badge ${payClass}">${(booking.paymentStatus || 'pending').toUpperCase()}</span></td></tr>
        </table>
      </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: center">Nights</th>
                <th style="text-align: right">Rate</th>
                <th style="text-align: right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <span class="item-name">${roomName}</span>
                    <span class="item-desc">Reservation for ${checkIn} to ${checkOut}</span>
                </td>
                <td style="text-align: center">${nights}</td>
                <td style="text-align: right">KES ${fmt(perNight)}</td>
                <td style="text-align: right">KES ${fmt(perNight * nights)}</td>
            </tr>
        </tbody>
    </table>

    <div class="summary">
        <table class="summary-table">
            <tr>
                <td class="label">Subtotal</td>
                <td class="value">KES ${fmt(perNight * nights)}</td>
            </tr>
            <tr>
                <td class="label">Service Fee (0%)</td>
                <td class="value">KES 0.00</td>
            </tr>
            <tr class="total-row">
                <td class="label">Total Amount</td>
                <td class="value">KES ${fmt(total)}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
      <div class="footer-left">
        <strong>Terms & Conditions:</strong><br>
        Check-in: 2:00 PM | Check-out: 11:00 AM. Cancellations must be made 48 hours in advance for a full refund. Thank you for staying with us.
      </div>
      <div class="footer-right">
        Norden Suites &copy; ${year}<br>
        Developed by | <a href="https://kkdes.co.ke/" target="_blank">KKDES</a>
      </div>
    </div>
    
    <button class="print-btn" onclick="window.print()">Print Invoice</button>
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
  let browser;
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

    if (chromium) {
      browser = await puppeteer.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      const paths = [
        process.env.CHROME_PATH,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        '/usr/bin/chromium-browser',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chrome'
      ];
      const executablePath = paths.find(p => p && fs.existsSync(p));

      if (!executablePath) {
        throw new Error('Chromium/Chrome binary not found. Please ensure Chrome is installed.');
      }

      browser = await puppeteer.launch({
        executablePath,
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      });
    }

    const page = await browser.newPage();
    // Emulate screen to ensure full-color backgrounds and images render correctly
    await page.emulateMediaType('screen');
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Explicit wait to ensure all Base64 images and fonts are processed
    await new Promise(r => setTimeout(r, 1000));

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
      preferCSSPageSize: true
    });

    const ref = booking.bookingReference || booking.reference || id;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="NordenSuites-Invoice-${ref}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Invoice PDF error:', error);
    res.status(500).json({ success: false, message: 'PDF Error: ' + error.message });
  } finally {
    if (browser) await browser.close();
  }
});

// ── Shared Helper for PDF Generation (used by Email) ─────────────────────────
const generatePDFBuffer = async (html) => {
  const puppeteer = require('puppeteer-core');
  let browser;
  try {
    let chromium;
    try { chromium = require('@sparticuz/chromium'); } catch (e) { chromium = null; }

    let executablePath;
    if (chromium) {
      executablePath = await chromium.executablePath();
    } else {
      const paths = [
        process.env.CHROME_PATH,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        '/usr/bin/chromium-browser',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium'
      ];
      executablePath = paths.find(p => p && fs.existsSync(p));
    }

    if (!executablePath) throw new Error('PDF Engine not found');

    browser = await puppeteer.launch({
      executablePath,
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.emulateMediaType('screen');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    return pdf;
  } finally {
    if (browser) await browser.close();
  }
};

// ── POST /api/bookings/:id/invoice/send  — Email invoice to guest ────────────
router.post('/:id/invoice/send', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid booking ID' });

    const booking = await prisma.booking.findUnique({ where: { id }, include: { room: true, user: true } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const guestEmail = booking.guestEmail || booking.user?.email;
    if (!guestEmail) {
      return res.status(400).json({ success: false, message: 'No guest email address found.' });
    }

    const guestName = booking.guestName || (booking.user ? booking.user.name : 'Guest');
    const ref = booking.bookingReference || booking.reference || booking.id;
    const subject = `🧾 Your Invoice – Norden Suites | Ref: ${ref}`;

    // Create the PDF buffer
    const invoiceHTML = buildInvoiceHTML(booking);
    let pdfBuffer;
    try {
      pdfBuffer = await generatePDFBuffer(invoiceHTML);
    } catch (pdfErr) {
      console.warn('Could not generate PDF attachment, sending email only:', pdfErr.message);
    }

    const emailBody = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;line-height:1.6">
  <div style="background:#0A0B0D;padding:30px;text-align:center;border-radius:10px 10px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px">NORDEN SUITES</h1>
  </div>
  <div style="padding:40px;border:1px solid #eee;border-top:none;border-radius:0 0 10px 10px">
    <h2 style="margin-top:0">Reservation Invoice</h2>
    <p>Dear ${guestName},</p>
    <p>Please find attached your official invoice for your stay at <strong>Norden Suites</strong>.</p>
    <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:25px 0">
        <p style="margin:5px 0"><strong>Reference:</strong> ${ref}</p>
        <p style="margin:5px 0"><strong>Suite:</strong> ${booking.room?.name || 'Luxury Suite'}</p>
        <p style="margin:5px 0"><strong>Total:</strong> KES ${fmt(booking.totalPrice)}</p>
    </div>
    <p>We look forward to hosting you. If you have any questions, simply reply to this email.</p>
    <p style="margin-top:30px">Best regards,<br><strong>Management, Norden Suites</strong></p>
  </div>
  <p style="text-align:center;font-size:11px;color:#999;margin-top:20px">
    Developed by | <a href="https://kkdes.co.ke/" style="color:#999">KKDES</a>
  </p>
</div>`;

    const attachments = pdfBuffer ? [{
      filename: `NordenSuites-Invoice-${ref}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }] : [];

    const result = await sendEmail(guestEmail, subject, emailBody, attachments);

    if (result.success) {
      res.json({ success: true, message: `Invoice emailed to ${guestEmail} with PDF attachment.` });
    } else {
      res.status(500).json({ success: false, message: result.error || 'SMTP Error. Check settings.' });
    }
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
