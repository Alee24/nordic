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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel p-6 md:p-8 flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto -mt-10 relative z-20 shadow-2xl"
            >
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="text-sm font-light text-theme-muted uppercase tracking-widest">Check In</label>
                    <div className="flex items-center gap-2 border-b border-theme-border pb-2">
                        <Calendar size={18} className="text-nordic-gold-500" />
                        <input
                            type="date"
                            className="bg-transparent text-theme-text outline-none w-full"
                            value={dates.checkIn}
                            onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="text-sm font-light text-theme-muted uppercase tracking-widest">Check Out</label>
                    <div className="flex items-center gap-2 border-b border-theme-border pb-2">
                        <Calendar size={18} className="text-nordic-gold-500" />
                        <input
                            type="date"
                            className="bg-transparent text-theme-text outline-none w-full"
                            value={dates.checkOut}
                            onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="text-sm font-light text-theme-muted uppercase tracking-widest">Residents</label>
                    <div className="flex items-center gap-2 border-b border-theme-border pb-2">
                        <Users size={18} className="text-nordic-gold-500" />
                        <select
                            className="bg-transparent text-theme-text outline-none w-full bg-theme-surface"
                            value={numResidents}
                            onChange={(e) => setNumResidents(parseInt(e.target.value))}
                        >
                            <option className="bg-theme-surface" value="1">1 Resident</option>
                            <option className="bg-theme-surface" value="2">2 Residents</option>
                            <option className="bg-theme-surface" value="3">3 Residents</option>
                            <option className="bg-theme-surface" value="4">4+ Residents</option>
                        </select>
                    </div>
                </div>

                <Button
                    className="w-full md:w-auto mt-4 md:mt-0"
                    onClick={() => setOpened(true)}
                >
                    Book Now
                </Button>
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
