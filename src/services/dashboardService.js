import api from './api';

export const dashboardService = {
    /**
     * Get all dashboard statistics
     * @returns {Promise<{success: boolean, data: object, error: string}>}
     */
    getStatistics: async (demo = true) => {
        try {
            const response = await api.get('/dashboard/statistics');
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Dashboard Stats Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch statistics'
            };
        }
    },

    getRecentBookings: async (limit = 10, demo = false) => {
        try {
            const response = await api.get(`/dashboard/recent-bookings?limit=${limit}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Recent Bookings Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch recent bookings'
            };
        }
    },

    getGuests: async (demo = false) => {
        try {
            const response = await api.get('/dashboard/guests');
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Guests Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch guests'
            };
        }
    },

    getMonthlyRevenue: async (months = 12) => {
        try {
            // Fallback to statistics for now if not implemented
            const response = await api.get('/dashboard/statistics');
            return { success: true, data: [] };
        } catch (error) {
            return { success: false, error: 'Not implemented' };
        }
    },

    getOccupancyTrends: async (days = 30) => {
        try {
            return { success: true, data: [] };
        } catch (error) {
            return { success: false, error: 'Not implemented' };
        }
    },

    getRoomStatus: async (demo = false) => {
        try {
            const response = await api.get('/rooms');
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Room Status Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch room status'
            };
        }
    },

    addRoom: async (data) => {
        try {
            const response = await api.post('/rooms', data);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Add Room Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to add room'
            };
        }
    },

    updateRoom: async (id, data) => {
        try {
            const response = await api.put(`/rooms/${id}`, data);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Update Room Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update room'
            };
        }
    },

    deleteRoom: async (id) => {
        try {
            const response = await api.delete(`/rooms/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Delete Room Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete room'
            };
        }
    },

    getAllBookings: async (filters = {}, demo = false) => {
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/bookings?${params.toString()}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Get All Bookings Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch bookings'
            };
        }
    },

    updateBookingStatus: async (id, status) => {
        try {
            const response = await api.put(`/bookings/${id}`, { status });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Update Booking Status Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update booking status'
            };
        }
    },

    updateRoomStatus: async (id, status) => {
        try {
            const response = await api.put(`/rooms/${id}`, { status });
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Update Room Status Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update room status'
            };
        }
    },

    finalizeCheckin: async (id) => {
        try {
            const response = await api.post(`/bookings/${id}/checkin`);
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
            const response = await api.get(`/settings${category ? `?category=${category}` : ''}`);
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
            const response = await api.post('/settings', { key, value, category });
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
    },

    // ── SMTP Settings ──────────────────────────────────────────────────────────
    getSmtpSettings: async () => {
        try {
            const response = await api.get('/settings/smtp');
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to load SMTP settings' };
        }
    },

    saveSmtpSettings: async (data) => {
        try {
            const response = await api.put('/settings/smtp', data);
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to save SMTP settings' };
        }
    },

    testSmtpSettings: async (testEmail) => {
        try {
            const response = await api.post('/settings/smtp/test', { testEmail });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'SMTP test failed' };
        }
    },
};

