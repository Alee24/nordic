import { create } from 'zustand';

const useManagementStore = create((set) => ({
    isAdmin: true, // Default to true for development, normally this would come from auth
    currentView: 'guest', // 'guest' or 'staff'

    toggleAdmin: () => set((state) => ({ isAdmin: !state.isAdmin })),
    setView: (view) => set({ currentView: view }),

    // Storage for temporary content changes
    content: {},

    setContent: (id, value) => set((state) => ({
        content: { ...state.content, [id]: value }
    })),

    // Reset all changes
    resetContent: () => set({ content: {} }),

    // Syncing logic would go here
    syncToBackend: async () => {
        // Logic to save 'content' to Supabase
        console.log('Syncing to backend...', useManagementStore.getState().content);
    }
}));

export default useManagementStore;
