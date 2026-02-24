import axios from 'axios';

// Use relative URL so it works on both localhost and production (VPS via Apache proxy)
// Apache proxies /api → http://127.0.0.1:8123/api on the server
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only logout if we're actually logged in and the token is rejected
            if (localStorage.getItem('admin_token')) {
                localStorage.removeItem('admin_token');
                window.location.href = '/login'; // Or handle via store
            }
        }
        return Promise.reject(error);
    }
);

export default api;
