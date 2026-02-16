import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8569/backend/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
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
     * @param {boolean} demo
     * @returns {Promise<{success: boolean, data: array, error: string}>}
     */
    getRecentBookings: async (limit = 10, demo = false) => {
        try {
            const response = await api.get(`/dashboard.php?action=recent-bookings&limit=${limit}&demo=${demo}`);
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
     * Get all guests
     * @param {boolean} demo
     * @returns {Promise<{success: boolean, data: array, error: string}>}
     */
    getGuests: async (demo = false) => {
        try {
            const response = await api.get(`/dashboard.php?action=guests&demo=${demo}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Guests Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch guests'
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
     * @param {boolean} demo
     * @returns {Promise<{success: boolean, data: array, error: string}>}
     */
    getRoomStatus: async (demo = false) => {
        try {
            const response = await api.get(`/suites.php?demo=${demo}`);
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
     * @param {boolean} demo
     * @returns {Promise<{success: boolean, data: array, error: string}>}
     */
    getAllBookings: async (filters = {}, demo = false) => {
        try {
            const params = new URLSearchParams({ ...filters, demo });
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
    },

    /**
     * Upload room image
     * @param {File} file 
     */
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await api.post('/upload_image.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Upload Image Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to upload image'
            };
        }
    },

    /**
     * Get system settings
     */
    getSettings: async (category = null) => {
        try {
            const response = await api.get(`/settings.php${category ? `?category=${category}` : ''}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to fetch settings' };
        }
    },

    /**
     * Update a system setting
     */
    updateSetting: async (key, value, category = 'general') => {
        try {
            const response = await api.post('/settings.php', { key, value, category });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to update setting' };
        }
    },

    /**
     * Get flights data via AviationStack proxy
     */
    getFlights: async (params = {}) => {
        try {
            const response = await api.get('/aviation.php', { params: { action: 'flights', ...params } });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to fetch flight data' };
        }
    }
};
