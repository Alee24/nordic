import { create } from 'zustand';
import api from '../services/api';

const useManagementStore = create((set, get) => ({
    isAdmin: false,
    user: null,
    currentView: 'guest', // 'guest' or 'staff'
    loading: false,

    setView: (view) => set({ currentView: view }),

    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { user, token } = response.data.data;
                localStorage.setItem('admin_token', token);
                // Role check is case-insensitive — DB stores 'ADMIN' (uppercase)
                const isAdminRole = user.role?.toLowerCase() === 'admin';
                set({
                    isAdmin: isAdminRole,
                    user: user,
                    currentView: isAdminRole ? 'staff' : 'guest'
                });
                return { success: true, isAdmin: isAdminRole };
            }
            return { success: false, message: 'Login failed' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    },

    logout: async () => {
        try {
            localStorage.removeItem('admin_token');
            await api.post('/auth/logout');
            set({ isAdmin: false, user: null, currentView: 'guest' });
        } catch (error) {
            console.error('Logout failed', error);
        }
    },

    checkAuth: async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        set({ loading: true });
        try {
            const response = await api.get('/auth/check', { timeout: 5000 });
            if (response.data.success) {
                const user = response.data.data.user;
                const isAdminRole = user.role?.toLowerCase() === 'admin';
                set({
                    isAdmin: isAdminRole,
                    user: user,
                    currentView: isAdminRole ? 'staff' : 'guest'
                });
            } else {
                localStorage.removeItem('admin_token');
                set({ isAdmin: false, user: null, currentView: 'guest' });
            }
        } catch (error) {
            console.error('Auth verification failed:', error);
            localStorage.removeItem('admin_token');
            set({ isAdmin: false, user: null, currentView: 'guest' });
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
