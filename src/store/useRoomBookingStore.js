import { create } from 'zustand';
import roomApiService from '../services/roomApi';
import { notifications } from '@mantine/notifications';

const useRoomBookingStore = create((set, get) => ({
    // State
    availableRooms: [],
    activeBooking: null,
    isLoading: false,
    error: null,

    /**
     * Fetch all available rooms
     */
    fetchRooms: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await roomApiService.getAllRooms();
            set({
                availableRooms: response.data || [],
                isLoading: false
            });
        } catch (error) {
            set({
                error: error.message,
                isLoading: false
            });
            notifications.show({
                title: 'Error Loading Rooms',
                message: error.message,
                color: 'red',
            });
        }
    },

    /**
     * Start a new booking
     */
    startBooking: (data) => {
        set({
            activeBooking: {
                ...data,
                status: 'pending',
                id: crypto.randomUUID()
            }
        });
    },

    /**
     * Confirm selected room
     */
    confirmRoom: (room) => {
        const pricePerNight = Number(room.price ?? room.price_per_night ?? 0);
        set((state) => ({
            activeBooking: {
                ...state.activeBooking,
                suite: room,
                suite_id: room.id,
                total_price: pricePerNight * (state.activeBooking?.nights || 1)
            }
        }));
    },

    /**
     * Save booking to backend
     */
    saveBooking: async (guestData) => {
        set({ isLoading: true, error: null });
        const { activeBooking } = get();

        try {
            // Check availability first implicitly or explicitly via backend validation
            const bookingPayload = {
                guest_name: guestData.name,
                guest_email: guestData.email,
                guest_phone: guestData.phone || null,
                suite_id: activeBooking.suite_id,
                check_in: activeBooking.check_in,
                check_out: activeBooking.check_out,
                num_guests: activeBooking.num_guests,
                total_price: activeBooking.total_price
            };

            const response = await roomApiService.createBooking(bookingPayload);

            notifications.show({
                title: 'Booking Created!',
                message: 'Your room reservation has been created. Please complete payment.',
                color: 'green',
            });

            set({
                activeBooking: {
                    ...activeBooking,
                    booking_id: response.data.booking_id, // Ensure backend returns this
                    guest_name: guestData.name,
                    guest_email: guestData.email
                },
                isLoading: false
            });

            return true;
        } catch (error) {
            set({
                error: error.message,
                isLoading: false
            });
            notifications.show({
                title: 'Booking Failed',
                message: error.message,
                color: 'red',
            });
            return false;
        }
    },

    /**
     * Update payment status
     */
    updatePaymentStatus: async (status) => {
        const { activeBooking } = get();
        if (!activeBooking?.booking_id) return;

        try {
            await roomApiService.updatePaymentStatus(activeBooking.booking_id, status);

            set((state) => ({
                activeBooking: {
                    ...state.activeBooking,
                    payment_status: status,
                    status: status === 'paid' ? 'confirmed' : state.activeBooking.status
                }
            }));

            if (status === 'paid') {
                notifications.show({
                    title: 'Payment Confirmed!',
                    message: 'Your booking is now confirmed. We look forward to hosting you!',
                    color: 'green',
                });
            }
        } catch (error) {
            notifications.show({
                title: 'Payment Update Failed',
                message: error.message,
                color: 'red',
            });
        }
    },

    /**
     * Reset booking state
     */
    resetBooking: () => {
        set({ activeBooking: null, error: null });
    }
}));

export default useRoomBookingStore;
