const axios = require('axios');
const cloudbedsService = require('../services/cloudbedsService');

const startAuth = (req, res) => {
    const clientId = process.env.CLOUDBEDS_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/cloudbeds/callback`);
    const scope = encodeURIComponent('read:reservation,write:reservation,read:room,read:property');

    const authUrl = `https://hotels.cloudbeds.com/api/v1.1/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    res.redirect(authUrl);
};

const handleCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
        const response = await axios.post('https://api.cloudbeds.com/api/v1.1/access_token', {
            grant_type: 'authorization_code',
            client_id: process.env.CLOUDBEDS_CLIENT_ID,
            client_secret: process.env.CLOUDBEDS_CLIENT_SECRET,
            redirect_uri: `${req.protocol}://${req.get('host')}/api/cloudbeds/callback`,
            code
        });

        const { access_token, refresh_token, expires_in } = response.data;

        // In a real app, we'd save these to a DB or .env
        console.log('Cloudbeds Auth Success!');
        console.log('Access Token:', access_token);
        console.log('Refresh Token:', refresh_token);

        // For now, let's just return success
        res.json({
            success: true,
            message: 'Cloudbeds authenticated successfully. Please save the refresh token to your .env file.',
            refresh_token
        });
    } catch (error) {
        console.error('Cloudbeds Callback Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
};

const getInventory = async (req, res) => {
    try {
        const roomTypes = await cloudbedsService.getRoomTypes();
        res.json({ success: true, data: roomTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { startAuth, handleCallback, getInventory };
