import { create } from 'zustand';
import * as bookingApi from '../services/bookingApi';
import { notifications } from '@mantine/notifications';

const useBookingSystemStore = create((set, get) => ({
    // Search state
    searchFilters: {
        city: '',
        check_in: null,
        check_out: null,
        guests: 2,
        property_type: '',
        min_price: null,
        max_price: null,
        sort_by: 'rating',
    },
    searchResults: [],
    isSearching: false,

    // Property state
    selectedProperty: null,
    propertyRooms: [],
    selectedRoom: null,

    // Booking state
    currentBooking: null,
    myBookings: {
        upcoming: [],
        past: [],
        cancelled: [],
    },

    // User state
    currentUser: null,
    isAuthenticated: false,

    // Loading states
    isLoading: false,
    error: null,

    // SEARCH ACTIONS
    setSearchFilters: (filters) => {
        set({ searchFilters: { ...get().searchFilters, ...filters } });
    },

    searchProperties: async () => {
        set({ isSearching: true, error: null });
        try {
            const response = await bookingApi.searchProperties(get().searchFilters);
            set({
                searchResults: response.data.properties,
                isSearching: false
            });
        } catch (error) {
            set({ error: error.message, isSearching: false });
            notifications.show({
                title: 'Search Failed',
                message: error.message,
                color: 'red',
            });
        }
    },

    // PROPERTY ACTIONS
    fetchPropertyDetails: async (propertyId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await bookingApi.getPropertyById(propertyId);
            set({
                selectedProperty: response.data,
                isLoading: false
            });
        } catch (error) {
            set({ error: error.message, isLoading: false });
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red',
            });
        }
    },

    fetchPropertyRooms: async (propertyId, checkIn, checkOut) => {
        set({ isLoading: true, error: null });
        try {
            console.log('Fetching rooms for:', propertyId, checkIn, checkOut);

            // REDESIGN: Hardcoded 3 room types as requested by user
            const staticRooms = [
                {
                    id: 1,
                    name: 'Deluxe Suite',
                    description: 'Elegant studio residence featuring luxury finishes, garden views, and a fully equipped kitchenette.',
                    base_price: 12000,
                    room_type: 'Deluxe',
                    max_occupancy: 2,
                    size_sqm: 45,
                    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80'],
                    amenities: ['King Bed', 'Kitchenette', 'High-speed WiFi', 'Garden View']
                },
                {
                    id: 2,
                    name: 'Executive Residence',
                    description: 'Sophisticated 1-bedroom apartment with ergonomic workspace, separate living area, and premium amenities.',
                    base_price: 20000,
                    room_type: 'Executive',
                    max_occupancy: 3,
                    size_sqm: 65,
                    photos: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80'],
                    amenities: ['1 Bedroom', 'Ergonomic Desk', 'Living Area', 'City View', 'Full Kitchen']
                },
                {
                    id: 3,
                    name: 'Norden Penthouse',
                    description: 'The pinnacle of coastal luxury. A expansive duplex penthouse with private terrace and panoramic ocean views.',
                    base_price: 35000,
                    room_type: 'Penthouse',
                    max_occupancy: 4,
                    size_sqm: 120,
                    photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80'],
                    amenities: ['Duplex Living', 'Private Terrace', 'Ocean View', 'Meeting Area', 'Butler Service']
                }
            ];

            console.log('Using hardcoded rooms:', staticRooms);

            set({
                propertyRooms: staticRooms,
                isLoading: false
            });

        } catch (error) {
            console.error('Error fetching rooms:', error);
            set({ error: error.message, isLoading: false, propertyRooms: [] });
            notifications.show({
                title: 'Error Loading Rooms',
                message: error.message || 'Failed to load rooms. Please try again.',
                color: 'red',
            });
        }
    },

    selectRoom: (room) => {
        set({ selectedRoom: room });
    },

    // BOOKING ACTIONS
    createBooking: async (bookingData) => {
        set({ isLoading: true, error: null });
        try {
            console.log('Creating booking with data:', bookingData);
            const response = await bookingApi.createBooking(bookingData);
            console.log('Booking response:', response);

            // Extract booking data from response.data.data (Node.js API structure)
            const booking = response?.data?.data || response?.data || {};

            set({
                currentBooking: booking,
                isLoading: false
            });

            notifications.show({
                title: 'Booking Confirmed!',
                message: `Your booking reference is: ${booking.booking_reference}`,
                color: 'green',
                autoClose: 5000,
            });

            return booking;
        } catch (error) {
            console.error('Booking error:', error);
            set({ error: error.message, isLoading: false });
            notifications.show({
                title: 'Booking Failed',
                message: error.message || 'Failed to create booking. Please try again.',
                color: 'red',
            });
            throw error;
        }
    },

    fetchMyBookings: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await bookingApi.getMyBookings(userId);
            set({
                myBookings: response.data,
                isLoading: false
            });
        } catch (error) {
            set({ error: error.message, isLoading: false });
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red',
            });
        }
    },

    // USER ACTIONS
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await bookingApi.loginUser(email, password);
            set({
                currentUser: response.data.user,
                isAuthenticated: true,
                isLoading: false
            });
            localStorage.setItem('user_token', response.data.token);
            localStorage.setItem('user_id', response.data.user.id);
            notifications.show({
                title: 'Welcome!',
                message: 'Login successful',
                color: 'green',
            });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            notifications.show({
                title: 'Login Failed',
                message: error.message,
                color: 'red',
            });
            throw error;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await bookingApi.registerUser(userData);
            notifications.show({
                title: 'Success!',
                message: 'Registration successful. Please login.',
                color: 'green',
            });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            notifications.show({
                title: 'Registration Failed',
                message: error.message,
                color: 'red',
            });
            throw error;
        }
    },

    logout: () => {
        set({
            currentUser: null,
            isAuthenticated: false,
            myBookings: { upcoming: [], past: [], cancelled: [] }
        });
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_id');
        notifications.show({
            title: 'Logged Out',
            message: 'You have been logged out successfully',
            color: 'blue',
        });
    },

    // RESET
    resetSearch: () => {
        set({
            searchFilters: {
                city: '',
                check_in: null,
                check_out: null,
                guests: 2,
                property_type: '',
                min_price: null,
                max_price: null,
                sort_by: 'rating',
            },
            searchResults: [],
        });
    },

    resetBooking: () => {
        set({
            selectedProperty: null,
            propertyRooms: [],
            selectedRoom: null,
            currentBooking: null,
        });
    },
}));

export default useBookingSystemStore;
