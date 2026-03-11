import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, MousePointerClick } from 'lucide-react';
import useComparisonStore from '../../store/useComparisonStore';
import Button from './Button';

const ComparisonTray = () => {
    const { selectedRooms, removeRoom, clearRooms, openModal } = useComparisonStore();

    if (selectedRooms.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl"
            >
                <div className="bg-theme-surface/95 backdrop-blur-md border border-theme-border rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <div className="bg-theme-accent/10 p-2 rounded-lg hidden sm:block">
                            <ArrowRightLeft className="text-theme-accent" size={24} />
                        </div>

                        <div className="flex -space-x-3 overflow-hidden">
                            {selectedRooms.map((room) => (
                                <div key={room.id} className="relative group flex-shrink-0">
                                    <img
                                        src={room.image}
                                        alt={room.name}
                                        className="w-12 h-12 rounded-full border-2 border-theme-surface object-cover"
                                    />
                                    <button
                                        onClick={() => removeRoom(room.id)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            {[...Array(3 - selectedRooms.map(r => r.id).length)].map((_, i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-dashed border-theme-border bg-theme-bg/50 flex items-center justify-center text-theme-muted">
                                    <span className="text-[10px] uppercase font-bold tracking-tighter">Add</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-theme-text font-bold text-sm">Comparison List</span>
                            <span className="text-theme-accent/70 text-[10px] uppercase font-black tracking-widest">
                                {selectedRooms.length} of 3 Selected
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={clearRooms}
                            className="text-norden-gold-500/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest hidden sm:block"
                        >
                            Clear
                        </button>
                        <Button
                            onClick={openModal}
                            disabled={selectedRooms.length < 2}
                            className="bg-norden-gold-600 hover:bg-norden-gold-500 text-norden-dark-900 text-xs font-black uppercase tracking-widest px-6 h-10 rounded-full"
                        >
                            {selectedRooms.length < 2 ? 'Add more to Compare' : 'Compare Now'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ComparisonTray;
