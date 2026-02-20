import axios from 'axios';

// Use the Node.js API server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8123/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.data);
        return response;
    },
    (error) => {
        console.error('Response Error:', error.response || error.message);
        return Promise.reject(error);
    }
);

// Error handler
const handleError = (error) => {
    if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || error.response.data?.error || 'Server error occurred';
        throw new Error(message);
    } else if (error.request) {
        // No response received
        throw new Error('No response from server. Please check if the API server is running.');
    } else {
        // Request setup error
        throw new Error(error.message || 'An unexpected error occurred');
    }
};

// PROPERTIES
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

// ROOMS
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
        const response = await api.get('/my-bookings', {
            params: { user_id: userId }
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getBookingById = async (bookingId) => {
    try {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// SEARCH
export const searchProperties = async (filters) => {
    try {
        const response = await api.get('/search', { params: filters });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export default {
    getAllProperties,
    getPropertyById,
    getRoomsByProperty,
    getRoomDetails,
    createBooking,
    getMyBookings,
    getBookingById,
    searchProperties,
};
