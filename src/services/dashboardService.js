import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8569/backend/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const dashboardService = {
    /**
     * Get all dashboard statistics
     * @returns {Promise<{success: boolean, data: object, error: string}>}
     */
    getStatistics: async (demo = true) => {
        try {
            const response = await api.get(`/dashboard.php?action=statistics&demo=${demo}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Dashboard Stats Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch statistics'
            };
        }
    },

    /**
     * Get recent bookings
     * @param {number} limit 
     * @returns {Promise<{success: boolean, data: array, error: string}>}
     */
    getRecentBookings: async (limit = 10) => {
        try {
            const response = await api.get(`/dashboard.php?action=recent-bookings&limit=${limit}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Recent Bookings Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch recent bookings'
            };
        }
    },

    /**
     * Get monthly revenue data
     * @param {number} months 
     * @returns {Promise<{success: boolean, data: array, error: string}>}
     */
    getMonthlyRevenue: async (months = 12) => {
        try {
            const response = await api.get(`/dashboard.php?action=monthly-revenue&months=${months}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Monthly Revenue Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch revenue data'
            };
        }
    },

    /**
     * Get occupancy trends
     * @param {number} days 
     * @returns {Promise<{success: boolean, data: array, error: string}>}
     */
    getOccupancyTrends: async (days = 30) => {
        try {
            const response = await api.get(`/dashboard.php?action=occupancy-trends&days=${days}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Occupancy Trends Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch occupancy trends'
            };
        }
    },

    /**
     * Get all rooms/suites with their current status
     * @returns {Promise<{success: boolean, data: array, error: string}>}
     */
    getRoomStatus: async () => {
        try {
            const response = await api.get('/suites.php');
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Room Status Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch room status'
            };
        }
    },

    /**
     * Add a new room
     * @param {object} data 
     */
    addRoom: async (data) => {
        try {
            const response = await api.post('/suites.php', data);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Add Room Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to add room'
            };
        }
    },

    /**
     * Update room details
     * @param {string} id 
     * @param {object} data 
     */
    updateRoom: async (id, data) => {
        try {
            const response = await api.put(`/suites.php?id=${id}`, data);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Update Room Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update room'
            };
        }
    },

    /**
     * Delete a room
     * @param {string} id 
     */
    deleteRoom: async (id) => {
        try {
            const response = await api.delete(`/suites.php?id=${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Delete Room Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete room'
            };
        }
    },

    /**
     * Get all bookings with filters
     * @param {object} filters 
     * @returns {Promise<{success: boolean, data: array, error: string}>}
     */
    getAllBookings: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/dashboard.php?action=bookings&${params.toString()}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Get All Bookings Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch bookings'
            };
        }
    },

    /**
     * Update booking status
     * @param {string} id 
     * @param {string} status 
     * @returns {Promise<{success: boolean, data: object, error: string}>}
     */
    updateBookingStatus: async (id, status) => {
        try {
            const response = await api.put(`/dashboard.php?action=update-booking-status&id=${id}`, { status });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Update Booking Status Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update booking status'
            };
        }
    },

    /**
     * Update room status
     * @param {string} id 
     * @param {string} status 
     */
    updateRoomStatus: async (id, status) => {
        try {
            const response = await api.put(`/dashboard.php?action=update-room-status&id=${id}`, { status });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Update Room Status Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update room status'
            };
        }
    },

    /**
     * Finalize check-in
     * @param {string} id Booking ID
     */
    finalizeCheckin: async (id) => {
        try {
            const response = await api.post(`/dashboard.php?action=finalize-checkin&id=${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Finalize Check-in Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to finalize check-in'
            };
        }
    }
};
