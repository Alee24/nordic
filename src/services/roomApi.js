import api from './api';

// Error handler
const handleError = (error) => {
    if (error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
    } else {
        throw new Error(error.message || 'An unexpected error occurred');
    }
};

export const roomApiService = {
    /**
     * Get all available suites/rooms
     */
    getAllRooms: async () => {
        try {
            const response = await api.get('/rooms');
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Check availability
     */
    checkAvailability: async (suiteId, checkIn, checkOut) => {
        try {
            const response = await api.post('/suites/check-availability', {
                suite_id: suiteId,
                check_in: checkIn,
                check_out: checkOut
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Create a new booking
     */
    createBooking: async (bookingData) => {
        try {
            const response = await api.post('/bookings', bookingData);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Update payment status
     */
    updatePaymentStatus: async (bookingId, status) => {
        try {
            const response = await api.put(`/bookings/${bookingId}/payment`, { status });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
};

export default roomApiService;
