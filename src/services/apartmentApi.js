import axios from 'axios';

// Use strict relative path or environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/apartments.php`
    : 'http://localhost:8569/nordic/backend/api/apartments.php';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getBuildingMap = async () => {
    try {
        const response = await axios.get(API_BASE_URL + '/map');
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const getUnitDetails = async (unitId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/unit?id=${unitId}`);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const createBooking = async (bookingData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/book`, bookingData);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export default {
    getBuildingMap,
    getUnitDetails,
    createBooking
};
