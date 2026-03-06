import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { Users, Maximize, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useBookingModalStore from '../../store/useBookingModalStore';

const RoomCard = ({ room }) => {
    const navigate = useNavigate();
    const openBooking = useBookingModalStore(s => s.openBooking);

    return (
        <motion.div
            whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => navigate(`/suite/${room.id}`)}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-theme-border shadow-sm bg-theme-surface h-[440px] w-full md:w-[350px] flex-shrink-0 transition-all duration-300 ease-out cursor-pointer"
        >
            {/* Top Image Area */}
            <div className="relative h-[220px] w-full overflow-hidden shrink-0">
                <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={e => {
                        e.target.src = '/images/b11.jpg';
                    }}
                />
                {/* Badge */}
                {room.badge && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="inline-block px-3 py-1 bg-norden-gold-500 text-norden-dark-900 text-[10px] font-black uppercase tracking-widest rounded-sm shadow-md">
                            {room.badge}
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom Content Area */}
            <div className="p-6 flex flex-col flex-grow bg-theme-surface">
                <h3 className="text-xl font-medium text-theme-text mb-5">{room.name}</h3>

                <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center text-sm text-theme-muted gap-3">
                        <Users size={18} className="text-norden-gold-600" />
                        <span>Max {room.capacity || 2} paxs</span>
                    </div>
                    <div className="flex items-center text-sm text-theme-muted gap-3">
                        <Maximize size={18} className="text-norden-gold-600" />
                        <span>{room.size || '60 sqm / 646 sqft'}</span>
                    </div>
                </div>

                {/* Buttons (pushed to bottom) */}
                <div className="mt-auto grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="w-full text-theme-text border-theme-border hover:bg-theme-border/50 text-sm font-medium h-11"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/suite/${room.id}`);
                        }}
                    >
                        Learn more
                    </Button>
                    <Button
                        className="w-full bg-norden-gold-600 hover:bg-norden-gold-500 text-norden-dark-900 text-sm font-bold h-11"
                        onClick={(e) => {
                            e.stopPropagation();
                            openBooking(room.id);
                        }}
                    >
                        Book now
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default RoomCard;
