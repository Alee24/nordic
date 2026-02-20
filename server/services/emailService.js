const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Norden Suits" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

const sendBookingConfirmation = async (booking) => {
    const subject = `Booking Confirmation - ${booking.room.name}`;
    const html = `
        <h1>Welcome to Norden Suits</h1>
        <p>Dear ${booking.user.name || 'Guest'},</p>
        <p>Your booking for <strong>${booking.room.name}</strong> has been confirmed.</p>
        <ul>
            <li>Check-in: ${new Date(booking.checkIn).toLocaleDateString()}</li>
            <li>Check-out: ${new Date(booking.checkOut).toLocaleDateString()}</li>
            <li>Total Price: KES ${booking.totalPrice}</li>
        </ul>
        <p>We look forward to hosting you.</p>
        <hr />
        <footer>Developed by | KKDES "https://kkdes.co.ke/"</footer>
    `;
    return sendEmail(booking.user.email, subject, html);
};

const sendContactNotification = async (message) => {
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
    // Send to admin (using info email as fallback admin email)
    return sendEmail(process.env.SMTP_USER, subject, html);
};

module.exports = { sendEmail, sendBookingConfirmation, sendContactNotification };
