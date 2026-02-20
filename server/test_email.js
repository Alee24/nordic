require('dotenv').config();
const { sendEmail } = require('./services/emailService');

async function testEmail() {
    console.log('Testing SMTP connection for:', process.env.SMTP_USER);
    const result = await sendEmail(
        process.env.SMTP_USER,
        'Nordic Suites - SMTP Test',
        '<p>This is a test email from <strong>Nordic Suites</strong>.</p><hr/><p>Developed by | KKDES</p>'
    );

    if (result.success) {
        console.log('Test successful! Message ID:', result.messageId);
    } else {
        console.error('Test failed:', result.error);
    }
    process.exit(0);
}

testEmail();
