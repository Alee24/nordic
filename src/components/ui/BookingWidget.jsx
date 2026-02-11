import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { Calendar, Users } from 'lucide-react';

const BookingWidget = () => {
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6 md:p-8 flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto -mt-10 relative z-20 shadow-2xl"
        >
            <div className="flex flex-col gap-2 w-full md:w-auto">
                <label className="text-sm font-light text-theme-muted uppercase tracking-widest">Check In</label>
                <div className="flex items-center gap-2 border-b border-theme-border pb-2">
                    <Calendar size={18} className="text-nordic-gold-500" />
                    <input type="date" className="bg-transparent text-theme-text outline-none w-full" />
                </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
                <label className="text-sm font-light text-theme-muted uppercase tracking-widest">Check Out</label>
                <div className="flex items-center gap-2 border-b border-theme-border pb-2">
                    <Calendar size={18} className="text-nordic-gold-500" />
                    <input type="date" className="bg-transparent text-theme-text outline-none w-full" />
                </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
                <label className="text-sm font-light text-theme-muted uppercase tracking-widest">Guests</label>
                <div className="flex items-center gap-2 border-b border-theme-border pb-2">
                    <Users size={18} className="text-nordic-gold-500" />
                    <select className="bg-transparent text-theme-text outline-none w-full bg-theme-surface">
                        <option className="bg-theme-surface">1 Resident</option>
                        <option className="bg-theme-surface">2 Residents</option>
                        <option className="bg-theme-surface">3 Residents</option>
                        <option className="bg-theme-surface">4+ Residents</option>
                    </select>
                </div>
            </div>

            <Button className="w-full md:w-auto mt-4 md:mt-0">
                Check Availability
            </Button>
        </motion.div>
    );
};

export default BookingWidget;
