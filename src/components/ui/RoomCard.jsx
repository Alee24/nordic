import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowRight, Wifi, Coffee, Tv } from 'lucide-react';

const RoomCard = ({ room }) => {
    return (
        <motion.div
            whileHover={{ y: -15, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-xl shadow-2xl bg-theme-surface h-[500px] w-full md:w-[350px] flex-shrink-0 transition-all duration-500 ease-out cursor-pointer"
        >
            <div className="absolute inset-0 z-0">
                <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-nordic-dark-900/90 via-nordic-dark-900/40 to-transparent z-1" />
                {/* Glint Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out z-2" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
                <h3 className="text-2xl font-serif text-white mb-2 drop-shadow-md">{room.name}</h3>
                <p className="text-gray-200 text-sm mb-4 line-clamp-2 drop-shadow-sm">{room.description}</p>

                <div className="flex gap-4 mb-6 text-nordic-gold-400">
                    <Wifi size={18} className="drop-shadow-sm" />
                    <Coffee size={18} className="drop-shadow-sm" />
                    <Tv size={18} className="drop-shadow-sm" />
                </div>

                <div className="flex justify-between items-center transitiion-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-xl font-bold text-white drop-shadow-md">${room.price} <span className="text-sm font-normal text-gray-300">/ night</span></span>
                    <Button variant="outline" className="!px-4 !py-2 text-sm flex items-center gap-2 border-white/40 text-white hover:bg-white hover:text-nordic-dark-900">
                        View <ArrowRight size={14} />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default RoomCard;
