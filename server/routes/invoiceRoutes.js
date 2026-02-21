const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/bookings/:id/invoice  - generate downloadable HTML invoice (browser can print→PDF)
router.get('/:id/invoice', authMiddleware, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { room: true, user: true }
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const fmt = (n) => Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

    const guestName = booking.guestName || (booking.user ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() : 'Guest');
    const guestEmail = booking.guestEmail || booking.user?.email || '';
    const guestPhone = booking.guestPhone || booking.user?.phone || 'Not provided';
    const roomName = booking.room?.name || 'Suite';
    const checkIn = fmtDate(booking.checkIn);
    const checkOut = fmtDate(booking.checkOut);
    const nights = booking.checkIn && booking.checkOut
      ? Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))
      : 1;
    const perNight = booking.room?.price || 0;
    const total = booking.totalPrice || 0;
    const ref = booking.bookingReference || booking.reference || booking.id;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice ${ref}</title>
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
      <p>Issued: ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>
  <div class="body">
    <div class="ref-badge">REF: ${ref}</div>
    <div style="display:flex;gap:40px;margin-bottom:30px">
      <div class="section" style="flex:1">
        <h3>Billed To</h3>
        <div class="row"><span class="label">Name</span><span class="value">${guestName}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${guestEmail}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${guestPhone}</span></div>
      </div>
      <div class="section" style="flex:1">
        <h3>Booking Status</h3>
        <div class="row"><span class="label">Status</span>
          <span class="badge ${booking.status === 'confirmed' || booking.status === 'checked_out' ? 'badge-green' : booking.status === 'pending' ? 'badge-yellow' : 'badge-red'}">${(booking.status || 'pending').replace('_', ' ').toUpperCase()}</span>
        </div>
        <div class="row"><span class="label">Payment</span>
          <span class="badge ${booking.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}">${(booking.paymentStatus || 'pending').toUpperCase()}</span>
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
      <p style="font-size:12px;color:#0369a1;line-height:1.6">Thank you for choosing Norden Suites. For any queries regarding this invoice, please contact us at info@nordensuites.com</p>
    </div>
    <div class="no-print" style="margin-top:24px;text-align:center">
      <button onclick="window.print()" style="background:#2563eb;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">🖨 Print / Save as PDF</button>
    </div>
  </div>
  <div class="footer">
    <div class="footer-brand">Norden Suites &copy; ${new Date().getFullYear()}</div>
    <div class="footer-brand">Developed by <a href="https://kkdes.co.ke/" target="_blank">KKDES</a></div>
  </div>
</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${ref}.html"`);
    res.send(html);
  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
