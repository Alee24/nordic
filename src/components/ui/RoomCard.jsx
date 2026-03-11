import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { Users, Maximize, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useBookingModalStore from '../../store/useBookingModalStore';
import useComparisonStore from '../../store/useComparisonStore';

const RoomCard = ({ room }) => {
    const navigate = useNavigate();
    const openBooking = useBookingModalStore(s => s.openBooking);
    const { toggleRoom, selectedRooms } = useComparisonStore();
    const isSelected = selectedRooms.some(r => r.id === room.id);

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
                        <span className="inline-block px-3 py-1 bg-theme-accent text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-md">
                            {room.badge}
                        </span>
                    </div>
                )}

                {/* Compare Button */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleRoom(room);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 flex items-center justify-center gap-2 group/btn ${isSelected
                            ? 'bg-theme-accent border-theme-accent text-white shadow-lg scale-110'
                            : 'bg-white/40 border-theme-border text-theme-text hover:bg-theme-accent hover:text-white'
                            }`}
                        title={isSelected ? "Remove from comparison" : "Add to comparison"}
                    >
                        <ArrowRightLeft size={16} className={`${isSelected ? 'rotate-180' : ''} transition-transform duration-500`} />
                        <span className="max-w-0 overflow-hidden group-hover/btn:max-w-xs transition-all duration-300 text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">
                            {isSelected ? 'Selected' : 'Compare'}
                        </span>
                    </button>
                </div>
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
                        className="w-full text-theme-text border-theme-border hover:bg-theme-border/50 text-xs md:text-sm font-semibold h-11 px-1 whitespace-nowrap tracking-wide"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/suite/${room.id}`);
                        }}
                    >
                        Learn more
                    </Button>
                    <Button
                        className="w-full bg-theme-accent hover:bg-theme-accent-hover text-white text-xs md:text-sm font-bold h-11 px-1 whitespace-nowrap tracking-wide"
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
