import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowRight, Wifi, Sparkles, Tv, Wind, Coffee, Users } from 'lucide-react';

const amenityIcons = {
    wifi: Wifi,
    ac: Wind,
    tv: Tv,
    coffee: Coffee,
    view: Sparkles,
    guests: Users
};

const BookableRoomCard = ({ room, onBookNow }) => {
    // Default standard amenities if none provided
    const displayAmenities = room.amenities?.slice(0, 3) || ['wifi', 'ac', 'view'];

    return (
        <motion.div
            whileHover={{ y: -15, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-xl shadow-2xl bg-theme-surface h-[500px] w-full flex-shrink-0 transition-all duration-500 ease-out cursor-pointer"
        >
            <div className="absolute inset-0 z-0">
                <img
                    src={room.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'}
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-theme-bg/40 to-transparent z-1" />
                {/* Glint Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out z-2" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
                {/* Room Capacity Badge */}
                <div className="mb-auto pt-4">
                    <span className="inline-block px-3 py-1 bg-nordic-gold-500/20 backdrop-blur-sm border border-nordic-gold-500/30 rounded-full text-nordic-gold-400 text-xs font-bold uppercase tracking-wider">
                        Max {room.capacity} Guests
                    </span>
                </div>

                <h3 className="text-2xl font-serif text-theme-text mb-2">{room.title}</h3>
                <p className="text-nordic-gray-300 text-sm mb-4 line-clamp-2">{room.description}</p>

                <div className="flex gap-4 mb-6 text-nordic-gold-400">
                    {displayAmenities.map((amenity, index) => {
                        const Icon = amenityIcons[amenity] || Sparkles;
                        return <Icon key={index} size={18} />;
                    })}
                </div>

                <div className="flex justify-between items-center transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-xl font-bold text-theme-text">
                        ${room.price_per_night} <span className="text-sm font-normal text-theme-muted">/ night</span>
                    </span>
                    <Button
                        variant="outline"
                        className="!px-4 !py-2 text-sm flex items-center gap-2"
                        onClick={() => onBookNow(room)}
                    >
                        Book Now <ArrowRight size={14} />
                    </Button>
                </div>

                {/* Availability Indicator - Logic can be enhanced based on backend data */}
                <div className="mt-2 text-xs text-theme-muted">
                    <span className="text-green-400">✓ Available for booking</span>
                </div>
            </div>
        </motion.div>
    );
};

export default BookableRoomCard;
