import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import Button from './Button';
import BookingFlowModal from '../booking/BookingFlowModal';

const BookingWidget = () => {
    const [opened, setOpened] = useState(false);
    const [dates, setDates] = useState({
        checkIn: '',
        checkOut: ''
    });

    const [numResidents, setNumResidents] = useState(1);

    const parsedDates = useMemo(() => [
        dates.checkIn ? new Date(dates.checkIn) : null,
        dates.checkOut ? new Date(dates.checkOut) : null
    ], [dates.checkIn, dates.checkOut]);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="max-w-5xl mx-auto -mt-16 md:-mt-20 relative z-30 px-4"
            >
                <div className="bg-theme-bg/80 backdrop-blur-2xl border border-norden-gold-500/20 rounded-[2rem] p-4 md:p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row gap-6 items-center">

                    {/* Check In */}
                    <div className="flex-1 w-full group">
                        <div className="px-6 py-3 rounded-2xl bg-theme-surface/30 border border-transparent group-hover:border-norden-gold-500/30 transition-all duration-300">
                            <label className="text-[10px] font-black text-norden-gold-500 uppercase tracking-[0.2em] mb-2 block">Check In</label>
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-norden-gold-500 group-hover:scale-110 transition-transform" />
                                <input
                                    type="date"
                                    className="bg-transparent text-theme-text font-serif text-lg outline-none w-full cursor-pointer"
                                    value={dates.checkIn}
                                    onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Divider for Desktop */}
                    <div className="hidden lg:block w-[1px] h-12 bg-norden-gold-500/20" />

                    {/* Check Out */}
                    <div className="flex-1 w-full group">
                        <div className="px-6 py-3 rounded-2xl bg-theme-surface/30 border border-transparent group-hover:border-norden-gold-500/30 transition-all duration-300">
                            <label className="text-[10px] font-black text-norden-gold-500 uppercase tracking-[0.2em] mb-2 block">Check Out</label>
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-norden-gold-500 group-hover:scale-110 transition-transform" />
                                <input
                                    type="date"
                                    className="bg-transparent text-theme-text font-serif text-lg outline-none w-full cursor-pointer"
                                    value={dates.checkOut}
                                    onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Divider for Desktop */}
                    <div className="hidden lg:block w-[1px] h-12 bg-norden-gold-500/20" />

                    {/* Guests */}
                    <div className="flex-1 w-full group">
                        <div className="px-6 py-3 rounded-2xl bg-theme-surface/30 border border-transparent group-hover:border-norden-gold-500/30 transition-all duration-300">
                            <label className="text-[10px] font-black text-norden-gold-500 uppercase tracking-[0.2em] mb-2 block">Guests</label>
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-norden-gold-500 group-hover:scale-110 transition-transform" />
                                <select
                                    className="bg-transparent text-theme-text font-serif text-lg outline-none w-full cursor-pointer appearance-none"
                                    value={numResidents}
                                    onChange={(e) => setNumResidents(parseInt(e.target.value))}
                                >
                                    <option className="bg-theme-bg" value="1">1 Guest</option>
                                    <option className="bg-theme-bg" value="2">2 Guests</option>
                                    <option className="bg-theme-bg" value="3">3 Guests</option>
                                    <option className="bg-theme-bg" value="4">4+ Guests</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="w-full lg:w-auto">
                        <button
                            onClick={() => setOpened(true)}
                            className="w-full lg:w-auto px-12 py-6 bg-norden-gold-500 hover:bg-norden-gold-600 text-norden-dark-900 font-bold uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-norden-gold-500/20 hover:scale-[1.02] transition-all duration-300 active:scale-95 whitespace-nowrap"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </motion.div>

            <BookingFlowModal
                opened={opened}
                onClose={() => setOpened(false)}
                initialDates={parsedDates}
                initialGuests={numResidents}
            />
        </>
    );
};

export default BookingWidget;
