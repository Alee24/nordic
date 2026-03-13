const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        // Allow production domain and all local dev origins
        const allowed = [
            'https://nordensuites.com',
            'https://www.nordensuites.com',
            'http://localhost:8124',
            'http://127.0.0.1:8124'
        ];
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in production for simplicity
        }
    },
    credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'mysql' });
});

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const additionalRoutes = require('./routes/additionalRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const pesapalRoutes = require('./routes/pesapalRoutes');
const siteMediaRoutes = require('./routes/siteMediaRoutes');
const cloudbedsRoutes = require('./routes/cloudbedsRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api', roomRoutes);
app.use('/api', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', additionalRoutes);
app.use('/api', uploadRoutes);
app.use('/api', settingsRoutes);
app.use('/api/bookings', invoiceRoutes);
app.use('/api', pesapalRoutes);
app.use('/api', siteMediaRoutes);
app.use('/api', cloudbedsRoutes);
app.use('/api/subscribers', subscriberRoutes);

const PORT = process.env.PORT || 8123;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
