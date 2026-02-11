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
            const response = await bookingApi.getRoomsByProperty(propertyId, checkIn, checkOut);
            set({
                propertyRooms: response.data,
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

    selectRoom: (room) => {
        set({ selectedRoom: room });
    },

    // BOOKING ACTIONS
    createBooking: async (bookingData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await bookingApi.createBooking(bookingData);
            set({
                currentBooking: response.data,
                isLoading: false
            });
            notifications.show({
                title: 'Success!',
                message: 'Booking created successfully',
                color: 'green',
            });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            notifications.show({
                title: 'Booking Failed',
                message: error.message,
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
