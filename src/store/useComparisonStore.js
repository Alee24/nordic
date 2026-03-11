import { create } from 'zustand';

const useComparisonStore = create((set) => ({
    selectedRooms: [],
    isModalOpen: false,

    toggleRoom: (room) => set((state) => {
        const exists = state.selectedRooms.find(r => r.id === room.id);
        if (exists) {
            return { selectedRooms: state.selectedRooms.filter(r => r.id !== room.id) };
        }
        if (state.selectedRooms.length >= 3) {
            // Limit to 3 rooms for comparison
            return state;
        }
        return { selectedRooms: [...state.selectedRooms, room] };
    }),

    removeRoom: (roomId) => set((state) => ({
        selectedRooms: state.selectedRooms.filter(r => r.id !== roomId)
    })),

    clearRooms: () => set({ selectedRooms: [] }),

    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
}));

export default useComparisonStore;
