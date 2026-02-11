import React from 'react';
import Section from '../components/ui/Section';
import RoomCard from '../components/ui/RoomCard';
import { motion } from 'framer-motion';

const SuitesPage = () => {
    const suites = [
        {
            id: 1,
            name: 'Executive 1-Bedroom',
            description: 'Spacious apartment with separate living area, full kitchenette, and expansive sea views.',
            price: 250,
            image: '/images/roomai1.jpg'
        },
        {
            id: 2,
            name: 'Business Studio',
            description: 'Compact yet efficient layout with dedicated workspace and views of the coastline.',
            price: 180,
            image: '/images/business1.jpg'
        },
        {
            id: 3,
            name: 'Nordic Suites Penthouse',
            description: 'Double-height residence on the 30th floor with private infinity pool and panoramic ocean views.',
            price: 650,
            image: '/images/home.jpg'
        },
        {
            id: 4,
            name: 'Family Residence',
            description: 'Two-bedroom apartment with full kitchen, laundry facilities, and large living room.',
            price: 320,
            image: '/images/liningc.jpg'
        },
        {
            id: 5,
            name: 'Long-Stay Loft',
            description: 'Designed for month-long stays with ample storage and home-office setup.',
            price: 200,
            image: '/images/home.jpg'
        },
        {
            id: 6,
            name: 'The Grand Apartment',
            description: 'Our largest residence, featuring a dining for 8, chef\'s kitchen, and 3 bedrooms.',
            price: 850,
            image: '/images/room.jpg'
        }
    ];

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
