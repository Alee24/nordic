import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BOOKING_API_URL || 'http://localhost:8569/nordic/backend/api/booking.php';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Error handler
const handleError = (error) => {
    if (error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
        throw new Error('No response from server');
    } else {
        throw new Error(error.message);
    }
};

// SEARCH & PROPERTIES
export const searchProperties = async (filters) => {
    try {
        const response = await api.get('/search', { params: filters });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getAllProperties = async (filters = {}) => {
    try {
        const response = await api.get('/properties', { params: filters });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getPropertyById = async (propertyId) => {
    try {
        const response = await api.get(`/properties/${propertyId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getRoomsByProperty = async (propertyId, checkIn, checkOut) => {
    try {
        const params = {};
        if (checkIn) params.check_in = checkIn;
        if (checkOut) params.check_out = checkOut;

        const response = await api.get(`/properties/${propertyId}/rooms`, { params });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getRoomDetails = async (roomId) => {
    try {
        const response = await api.get(`/rooms/${roomId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// BOOKINGS
export const createBooking = async (bookingData) => {
    try {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getMyBookings = async (userId) => {
    try {
        const response = await api.get('/my-bookings', { params: { user_id: userId } });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// REVIEWS
export const submitReview = async (reviewData) => {
    try {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getPropertyReviews = async (propertyId, limit = 10, offset = 0) => {
    try {
        const response = await api.get(`/properties/${propertyId}/reviews`, {
            params: { limit, offset }
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getPropertyRatings = async (propertyId) => {
    try {
        const response = await api.get(`/properties/${propertyId}/ratings`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// USER
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/users/register', userData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/users/login', { email, password });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getUserProfile = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    searchProperties,
    getAllProperties,
    getPropertyById,
    getRoomsByProperty,
    getRoomDetails,
    createBooking,
    getMyBookings,
    submitReview,
    getPropertyReviews,
    getPropertyRatings,
    registerUser,
    loginUser,
    getUserProfile,
};
