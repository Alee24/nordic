const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 8543;

// Middleware - Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Add explicit CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Database connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nordic',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM rooms');
        res.json({ success: true, roomCount: rows[0].count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all properties
app.get('/api/properties', async (req, res) => {
    try {
        const [properties] = await pool.query('SELECT * FROM properties');

        properties.forEach(prop => {
            prop.amenities = JSON.parse(prop.amenities || '[]');
            prop.images = JSON.parse(prop.images || '[]');
        });

        res.json({
            success: true,
            data: {
                properties,
                total: properties.length
            },
            message: 'Properties retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get property by ID
app.get('/api/properties/:id', async (req, res) => {
    try {
        const [properties] = await pool.query(
            'SELECT * FROM properties WHERE id = ?',
            [req.params.id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const property = properties[0];
        property.amenities = JSON.parse(property.amenities || '[]');
        property.images = JSON.parse(property.images || '[]');

        res.json({
            success: true,
            data: property,
            message: 'Property retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get rooms by property
app.get('/api/properties/:id/rooms', async (req, res) => {
    try {
        const { check_in, check_out } = req.query;

        const [rooms] = await pool.query(
            'SELECT * FROM rooms WHERE property_id = ? AND is_available = 1 ORDER BY base_price ASC',
            [req.params.id]
        );

        rooms.forEach(room => {
            room.amenities = JSON.parse(room.amenities || '[]');
            room.photos = JSON.parse(room.photos || '[]');
            room.base_price = parseFloat(room.base_price);
            room.max_occupancy = parseInt(room.max_occupancy);
            room.size_sqm = parseInt(room.size_sqm);
        });

        res.json({
            success: true,
            data: {
                rooms,
                total: rooms.length
            },
            message: 'Rooms retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create booking
app.post('/api/bookings', async (req, res) => {
    try {
        const {
            property_id,
            room_id,
            check_in,
            check_out,
            num_adults,
            num_children = 0,
            guest_name,
            guest_email,
            guest_phone,
            special_requests,
            user_id = null
        } = req.body;

        // Validate required fields
        if (!property_id || !room_id || !check_in || !check_out || !guest_name || !guest_email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Calculate nights and price
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        // Get room price
        const [rooms] = await pool.query('SELECT base_price, name FROM rooms WHERE id = ?', [room_id]);

        if (rooms.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const room = rooms[0];
        const totalAmount = parseFloat(room.base_price) * nights;

        // Generate booking reference
        const bookingReference = 'NS-' + Math.random().toString(36).substring(2, 12).toUpperCase();

        // Insert booking
        const [result] = await pool.query(
            `INSERT INTO bookings 
            (booking_reference, property_id, room_id, user_id, guest_name, guest_email, guest_phone,
             check_in, check_out, num_adults, num_children, special_requests, total_amount,
             booking_status, payment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
            [bookingReference, property_id, room_id, user_id, guest_name, guest_email, guest_phone,
                check_in, check_out, num_adults, num_children, special_requests, totalAmount]
        );

        res.status(201).json({
            success: true,
            data: {
                booking_id: result.insertId,
                booking_reference: bookingReference,
                total_amount: totalAmount,
                nights,
                room_name: room.name
            },
            message: 'Booking created successfully'
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user bookings
app.get('/api/my-bookings', async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }

        const [bookings] = await pool.query(
            `SELECT b.*, p.name as property_name, p.city, r.name as room_name, r.room_type
             FROM bookings b
             JOIN properties p ON b.property_id = p.id
             JOIN rooms r ON b.room_id = r.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [user_id]
        );

        const today = new Date().toISOString().split('T')[0];
        const upcoming = [];
        const past = [];
        const cancelled = [];

        bookings.forEach(booking => {
            booking.total_amount = parseFloat(booking.total_amount);

            if (booking.booking_status === 'cancelled') {
                cancelled.push(booking);
            } else if (booking.check_in > today) {
                upcoming.push(booking);
            } else {
                past.push(booking);
            }
        });

        res.json({
            success: true,
            data: { upcoming, past, cancelled, total: bookings.length },
            message: 'Bookings retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📊 Test endpoint: http://localhost:${PORT}/api/test\n`);

    // Test database connection
    pool.query('SELECT COUNT(*) as count FROM rooms')
        .then(([rows]) => {
            console.log(`✓ Database connected - ${rows[0].count} rooms available\n`);
        })
        .catch(err => {
            console.error('✗ Database connection failed:', err.message);
        });
});
