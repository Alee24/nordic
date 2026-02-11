import React, { useState, useEffect } from 'react';
import Section from '../components/ui/Section';
import BookableRoomCard from '../components/ui/BookableRoomCard';
import RoomBookingFunnel from '../components/booking/RoomBookingFunnel';
import { motion } from 'framer-motion';
import useRoomBookingStore from '../store/useRoomBookingStore';

const RoomsPage = () => {
    const [bookingModalOpened, setBookingModalOpened] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const { availableRooms, fetchRooms, isLoading } = useRoomBookingStore();

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleBookNow = (room) => {
        setSelectedRoom(room);
        setBookingModalOpened(true);
    };

    const handleCloseModal = () => {
        setBookingModalOpened(false);
        setSelectedRoom(null);
    };

    return (
        <div className="bg-theme-bg min-h-screen pt-20 transition-colors duration-300">
            <Section>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-nordic-gold-500 uppercase tracking-widest text-sm font-bold">Luxury Stays</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-theme-text mt-4 mb-6">Our Rooms & Suites</h1>
                    <p className="text-theme-muted max-w-2xl mx-auto text-lg">
                        Immerse yourself in comfort and elegance. Choose from our curated selection of rooms designed for your relaxation.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <p className="text-theme-muted">Loading available rooms...</p>
                    </div>
                ) : (
                    <motion.div
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {availableRooms.map((room) => (
                            <motion.div
                                key={room.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                            >
                                <BookableRoomCard room={room} onBookNow={handleBookNow} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Empty State */}
                {!isLoading && availableRooms.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-theme-muted text-lg">No rooms available at the moment.</p>
                        <p className="text-theme-muted text-sm mt-2">Please check back later or contact us for more information.</p>
                    </div>
                )}
            </Section>

            {/* Booking Modal */}
            <RoomBookingFunnel
                opened={bookingModalOpened}
                onClose={handleCloseModal}
                preselectedRoom={selectedRoom}
            />
        </div>
    );
};

export default RoomsPage;
