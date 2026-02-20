const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(cors({
    origin: ['http://localhost:8124', 'http://127.0.0.1:8124'],
    credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'postgres' });
});

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', roomRoutes);
app.use('/api', bookingRoutes);

const PORT = process.env.PORT || 8123;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
