import { create } from 'zustand';

/**
 * Global store that any component can use to open the BookingFlowModal.
 * Usage:
 *   const openBooking = useBookingModalStore(s => s.openBooking);
 *   openBooking();           // open with no preselection
 *   openBooking({ suiteName: '1 Bedroom City View' });  // pass hint
 */
const useBookingModalStore = create((set) => ({
    isOpen: false,
    preselectedSuite: null,

    openBooking: (suite = null) => set({ isOpen: true, preselectedSuite: suite }),
    closeBooking: () => set({ isOpen: false, preselectedSuite: null }),
}));

export default useBookingModalStore;
