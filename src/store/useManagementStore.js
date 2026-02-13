import { create } from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8569/backend/api';

// Configure axios for sessions
axios.defaults.withCredentials = true;

const useManagementStore = create((set, get) => ({
    isAdmin: false,
    user: null,
    currentView: 'guest', // 'guest' or 'staff'
    loading: false,

    setView: (view) => set({ currentView: view }),

    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE}/auth.php/login`, { email, password });
            if (response.data.success) {
                set({
                    isAdmin: response.data.data.user.account_type === 'admin',
                    user: response.data.data.user,
                    currentView: response.data.data.user.account_type === 'admin' ? 'staff' : 'guest'
                });
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    },

    logout: async () => {
        try {
            await axios.post(`${API_BASE}/auth.php/logout`);
            set({ isAdmin: false, user: null, currentView: 'guest' });
        } catch (error) {
            console.error('Logout failed', error);
        }
    },

    checkAuth: async () => {
        try {
            const response = await axios.get(`${API_BASE}/auth.php/check`);
            if (response.data.success) {
                set({
                    isAdmin: response.data.data.user.account_type === 'admin',
                    user: response.data.data.user
                });
            }
            set({ loading: false });
        } catch (error) {
            set({ isAdmin: false, user: null, loading: false });
        }
    },

    // Storage for temporary content changes
    content: {},

    setContent: (id, value) => set((state) => ({
        content: { ...state.content, [id]: value }
    })),

    // Reset all changes
    resetContent: () => set({ content: {} }),

    // Syncing logic
    syncToBackend: async () => {
        console.log('Syncing to backend...', get().content);
    }
}));

export default useManagementStore;
