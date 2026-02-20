import { create } from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8123/api';

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
                    isAdmin: response.data.data.user.role === 'admin',
                    user: response.data.data.user,
                    currentView: response.data.data.user.role === 'admin' ? 'staff' : 'guest'
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
        set({ loading: true });
        try {
            const response = await axios.get(`${API_BASE}/auth.php/check`, { timeout: 5000 });
            if (response.data.success) {
                set({
                    isAdmin: response.data.data.user.role === 'admin',
                    user: response.data.data.user
                });
            } else {
                set({ isAdmin: false, user: null });
            }
        } catch (error) {
            console.error('Auth verification failed:', error);
            set({ isAdmin: false, user: null });
        } finally {
            set({ loading: false });
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
