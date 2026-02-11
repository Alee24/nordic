import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { notifications } from '@mantine/notifications';

const useBookingStore = create((set, get) => ({
    activeBooking: null,
    isSyncing: false,

    startBooking: (data) => set({ activeBooking: { ...data, status: 'pending', id: crypto.randomUUID() } }),

    confirmSuite: (suite) => set((state) => ({
        activeBooking: { ...state.activeBooking, suite, total_price: suite.price }
    })),

    saveBooking: async (guestData) => {
        set({ isSyncing: true });
        const { activeBooking } = get();

        try {
            // 1. Save Guest
            const guestId = crypto.randomUUID();
            const { error: guestError } = await supabase
                .from('guests')
                .insert([{
                    id: guestId,
                    full_name: guestData.name,
                    email: guestData.email,
                    flight_number: activeBooking.flight_number
                }]);

            if (guestError) throw guestError;

            // 2. Save Booking
            const { error: bookingError } = await supabase
                .from('bookings')
                .insert([{
                    id: activeBooking.id,
                    guest_id: guestId,
                    suite_id: activeBooking.suite.id,
                    check_in: activeBooking.dates[0],
                    check_out: activeBooking.dates[1],
                    total_price: activeBooking.total_price,
                    status: 'pending'
                }]);

            if (bookingError) throw bookingError;

            notifications.show({
                title: 'Booking Saved',
                message: 'Your reservation is being processed. Please finalize payment.',
                color: 'gold',
            });

            set({
                activeBooking: { ...activeBooking, guest_id: guestId },
                isSyncing: false
            });

            return true;
        } catch (error) {
            console.error('Booking sync failed:', error);
            notifications.show({
                title: 'Sync Error',
                message: 'We could not sync your booking. Please try again.',
                color: 'red',
            });
            set({ isSyncing: false });
            return false;
        }
    },

    updatePaymentStatus: async (status) => {
        const { activeBooking } = get();
        if (!activeBooking?.id) return;

        try {
            const { error } = await supabase
                .from('bookings')
                .update({ payment_status: status })
                .eq('id', activeBooking.id);

            if (error) throw error;
            set((state) => ({ activeBooking: { ...state.activeBooking, payment_status: status } }));
        } catch (error) {
            console.error('Payment update failed:', error);
        }
    }
}));

export default useBookingStore;
