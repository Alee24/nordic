const axios = require('axios');
require('dotenv').config();

class CloudbedsService {
    constructor() {
        this.clientId = process.env.CLOUDBEDS_CLIENT_ID;
        this.clientSecret = process.env.CLOUDBEDS_CLIENT_SECRET;
        this.baseUrl = 'https://api.cloudbeds.com/api/v1.1';
        this.token = null;
        this.tokenExpires = null;
    }

    async getAccessToken() {
        if (this.token && this.tokenExpires > Date.now()) {
            return this.token;
        }

        const refreshToken = process.env.CLOUDBEDS_REFRESH_TOKEN;
        if (!refreshToken) {
            console.warn('No Cloudbeds refresh token found in environment. Please visit /api/cloudbeds/auth to authenticate.');
            return null;
        }

        try {
            console.log('Refreshing Cloudbeds access token...');
            const response = await axios.post('https://api.cloudbeds.com/api/v1.1/access_token', {
                grant_type: 'refresh_token',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: refreshToken
            });

            const { access_token, expires_in } = response.data;
            this.token = access_token;
            this.tokenExpires = Date.now() + (expires_in * 1000) - 60000; // Buffer of 1 min

            return this.token;
        } catch (error) {
            console.error('Cloudbeds Auth Error:', error.response?.data || error.message);
            return null;
        }
    }

    async request(method, endpoint, data = null, params = null) {
        const token = await this.getAccessToken();

        try {
            const response = await axios({
                method,
                url: `${this.baseUrl}${endpoint}`,
                data,
                params,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Cloudbeds API Error [${endpoint}]:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Example: Get Room Types
    async getRoomTypes() {
        return this.request('GET', '/getRoomTypes');
    }

    // Example: Check Availability
    async getAvailableRoomTypes(startDate, endDate) {
        return this.request('GET', '/getAvailableRoomTypes', null, {
            startDate,
            endDate
        });
    }

    // Example: Create Reservation
    async postReservation(reservationData) {
        return this.request('POST', '/postReservation', reservationData);
    }
}

module.exports = new CloudbedsService();
