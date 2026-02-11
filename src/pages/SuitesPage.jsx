import React from 'react';
import Section from '../components/ui/Section';
import RoomCard from '../components/ui/RoomCard';
import { motion } from 'framer-motion';
import { suites } from '../data/suites';

const SuitesPage = () => {

    return (
        <div className="bg-theme-bg min-h-screen pt-20 transition-colors duration-300">
            <Section>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-nordic-gold-500 uppercase tracking-widest text-sm font-bold">Luxury Living</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-theme-text mt-4 mb-6">Luxury Residences</h1>
                    <p className="text-theme-text/80 max-w-2xl mx-auto text-lg">
                        More than a hotel room. Fully serviced luxury apartments designed for living, working, and breathtaking views of the Nyali coast.
                    </p>
                </motion.div>

                <motion.div
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {suites.map((suite) => (
                        <motion.div
                            key={suite.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                        >
                            <RoomCard room={suite} />
                        </motion.div>
                    ))}
                </motion.div>
            </Section>
        </div>
    );
};

export default SuitesPage;
