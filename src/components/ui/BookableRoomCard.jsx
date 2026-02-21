import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowRight, Wifi, Sparkles, Tv, Wind, Coffee, Users } from 'lucide-react';

const BookableRoomCard = ({ room, onBookNow }) => {
    // Normalize fields: support both DB fields (name/price/imageUrl) and legacy (title/price_per_night/image_url)
    const name = room.name || room.title || 'Luxury Suite';
    const price = Number(room.price ?? room.price_per_night ?? 0);
    const image = room.imageUrl || room.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';
    const type = room.type || 'Suite';
    const description = room.description || '';
    const status = room.status || 'available';

    const isAvailable = status === 'available';

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-xl shadow-2xl bg-theme-surface h-[480px] w-full flex-shrink-0 transition-all duration-500 ease-out cursor-pointer"
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-theme-bg/40 to-transparent z-1" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out z-2" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
                {/* Type Badge */}
                <div className="mb-auto pt-4">
                    <span className="inline-block px-3 py-1 bg-nordic-gold-500/20 backdrop-blur-sm border border-nordic-gold-500/30 rounded-full text-nordic-gold-400 text-xs font-bold uppercase tracking-wider">
                        {type}
                    </span>
                </div>

                <h3 className="text-2xl font-serif text-theme-text mb-2">{name}</h3>
                <p className="text-nordic-gray-300 text-sm mb-4 line-clamp-2">{description || 'Luxury accommodation with premium amenities.'}</p>

                {/* Amenity icons */}
                <div className="flex gap-4 mb-4 text-nordic-gold-400">
                    <Wifi size={18} />
                    <Tv size={18} />
                    <Coffee size={18} />
                </div>

                {/* Price & Book */}
                <div className="flex justify-between items-center transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-xl font-bold text-theme-text">
                        KES {price.toLocaleString()} <span className="text-sm font-normal text-theme-muted">/ night</span>
                    </span>
                    {isAvailable && (
                        <Button
                            variant="outline"
                            className="!px-4 !py-2 text-sm flex items-center gap-2"
                            onClick={(e) => { e.stopPropagation(); onBookNow(room); }}
                        >
                            Book Now <ArrowRight size={14} />
                        </Button>
                    )}
                </div>

                {/* Availability */}
                <div className="mt-2 text-xs">
                    {isAvailable
                        ? <span className="text-green-400">✓ Available for booking</span>
                        : <span className="text-orange-400">⚠ Currently {status}</span>
                    }
                </div>
            </div>
        </motion.div>
    );
};

export default BookableRoomCard;
