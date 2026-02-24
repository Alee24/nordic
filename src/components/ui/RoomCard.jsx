import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowRight, Wifi, Coffee, Tv } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const RoomCard = ({ room }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ y: -15, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => navigate(`/suite/${room.id}`)}
            className="group relative overflow-hidden rounded-xl shadow-2xl bg-theme-surface h-[500px] w-full md:w-[350px] flex-shrink-0 transition-all duration-500 ease-out cursor-pointer"
        >
            <div className="absolute inset-0 z-0">
                <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={e => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-norden-dark-900/90 via-norden-dark-900/40 to-transparent" />
                {/* Glint Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            </div>

            {/* Badge */}
            {room.badge && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="inline-block px-3 py-1 bg-norden-gold-500 text-norden-dark-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        {room.badge}
                    </span>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
                <h3 className="text-2xl font-serif text-white mb-1 drop-shadow-md">{room.name}</h3>
                {room.subtitle && (
                    <p className="text-norden-gold-400 text-xs font-bold uppercase tracking-widest mb-2">{room.subtitle}</p>
                )}
                <p className="text-gray-200 text-sm mb-4 line-clamp-2 drop-shadow-sm">{room.description}</p>

                <div className="flex gap-4 mb-6 text-norden-gold-400">
                    <Wifi size={18} className="drop-shadow-sm" />
                    <Coffee size={18} className="drop-shadow-sm" />
                    <Tv size={18} className="drop-shadow-sm" />
                </div>

                <div className="flex justify-between items-center transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-xl font-bold text-white drop-shadow-md">
                        KES {(room.price || 0).toLocaleString()}
                        <span className="text-sm font-normal text-gray-300 ml-1">/ night</span>
                    </span>
                    <Link to={`/suite/${room.id}`} onClick={e => e.stopPropagation()}>
                        <Button
                            variant="outline"
                            className="!px-4 !py-2 text-sm flex items-center gap-2 border-white/40 text-white hover:bg-white hover:text-norden-dark-900"
                        >
                            View <ArrowRight size={14} />
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default RoomCard;
