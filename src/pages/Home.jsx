import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import BookingWidget from '../components/ui/BookingWidget';
import RoomCard from '../components/ui/RoomCard';
import { Star, MapPin, ArrowRight, Utensils, Sparkles, Briefcase, Wifi, Coffee, Key, Headset, Clock, LogIn, Home as HomeIcon, CalendarCheck, Building2, ParkingCircle } from 'lucide-react';
import { Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { suites } from '../data/suites';
import useBookingModalStore from '../store/useBookingModalStore';

const HERO_IMAGES = [
    '/images/living2_1.jpg',
    '/images/living2_2.jpg',
    '/images/living2_3.jpg',
    '/images/living2_4.jpg',
    '/images/living2_5.jpg'
];

const HeroBackground = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 6000); // Change image every 6 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden bg-norden-dark-900 z-0">
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={currentIndex}
                    src={HERO_IMAGES[currentIndex]}
                    alt="Luxury Residences"
                    className="absolute inset-0 w-full h-full object-cover origin-center"
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        opacity: { duration: 1.5, ease: 'easeInOut' },
                        scale: { duration: 8, ease: 'linear' } // Slow zoom-out effect
                    }}
                />
            </AnimatePresence>
        </div>
    );
};

const Home = () => {
    const openBooking = useBookingModalStore(s => s.openBooking);
    // Use first 3 real suites from the 2026 Rate Card
    const rooms = suites.slice(0, 3);

    return (
        <div className="bg-theme-bg min-h-screen transition-colors duration-300">

            {/* Hero Section */}
            <div className="relative h-screen w-full overflow-hidden">
                {/* Animated Background Slideshow */}
                <HeroBackground />

                {/* Darker overall overlay to ensure text visibility regardless of theme */}
                <div className="absolute inset-0 bg-norden-dark-900/40 pointer-events-none z-0" />
                {/* Fixed dark gradient to protect white text in both themes - prevents washing out in light mode */}
                <div className="absolute inset-0 bg-gradient-to-b from-norden-dark-900/60 via-transparent to-norden-dark-900/40 pointer-events-none z-0" />

                {/* Hero Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <span className="h-[1px] w-12 bg-norden-gold-500" />
                            <span className="text-norden-gold-500 uppercase tracking-[0.4em] text-xs md:text-sm font-extrabold drop-shadow-sm">Luxury Residences • Nyali Beach</span>
                            <span className="h-[1px] w-12 bg-norden-gold-500" />
                        </div>

                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif text-white mb-8 tracking-tighter drop-shadow-2xl leading-none">
                            NORDEN <span className="italic text-norden-gold-500 font-light underline decoration-norden-gold-500/30 underline-offset-8">Suites</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-gray-200 text-lg md:text-xl font-light mb-12 leading-relaxed drop-shadow-md">
                            NORDEN SUITES offers the freedom of a private high-end apartment with the
                            security and convenience of a professional concierge. Your home away from home.
                        </p>

                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            <Link to="/suites">
                                <Button className="bg-norden-gold-500 text-norden-dark-900">View Residences</Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="text-white border-white/40 hover:bg-white hover:text-norden-dark-900"
                                onClick={() => openBooking()}
                            >
                                <CalendarCheck size={16} className="mr-2" /> Book Now
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Booking Widget Overlay */}
            <div className="relative z-20 px-6">
                <BookingWidget />
            </div>

            {/* About Section */}
            <Section className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-2 mb-4 text-norden-gold-500">
                            <Sparkles size={20} />
                            <span className="uppercase tracking-widest text-sm font-bold">The Norden Lifestyle</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-theme-text mb-6">
                            Experience Freedom. <br /> <span className="text-gradient-gold italic">Hotel Soul.</span>
                        </h2>
                        <p className="text-theme-muted mb-6 leading-relaxed">
                            We’ve combined the best of both worlds. Every NORDEN SUITES residence is a fully-equipped home,
                            featuring a chef-grade kitchenette and premium designer finishes,
                            all supported by our signature 24/7 concierge and housekeeping.
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-norden-gold-500/10 p-2 rounded-full">
                                    <Building2 size={18} className="text-norden-gold-500" />
                                </div>
                                <span className="text-sm">Near Malls & Dining</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-norden-gold-500/10 p-2 rounded-full">
                                    <ParkingCircle size={18} className="text-norden-gold-500" />
                                </div>
                                <span className="text-sm">Secure Ample Parking</span>
                            </div>
                        </div>


                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] overflow-hidden rounded-lg">
                            <img
                                /* src="at&fit=crop" */
                                src="/images/street1.png"
                                alt="Coastal Apartment Interior"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </motion.div>
                </div>
            </Section>

            {/* Hybrid Advantages - Why Nordic Suites? */}
            <Section className="relative overflow-hidden bg-theme-surface/30">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-serif text-theme-text mb-6">Redefining the <br /><span className="italic text-norden-gold-500">Extended Stay</span></h2>
                    <p className="text-theme-muted text-lg">Experience the perfect synergy of residential privacy and five-star hospitality.</p>
                </div>

                <motion.div
                    variants={{
                        visible: { transition: { staggerChildren: 0.2 } }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-8"
                >
                    {[
                        { icon: <Utensils size={32} />, title: "Fully Furnished", desc: "Every suite is equipped with a premium chef-grade kitchen and designer furniture for a true home feel." },
                        { icon: <Sparkles size={32} />, title: "Daily Housekeeping", desc: "Immaculate maintenance while you relax and enjoy your stay in pristine conditions." },
                        { icon: <Star size={32} />, title: "Ultimate Comfort", desc: "Experience the warmth of a home with the luxury service and comfort of a five-star hotel." },
                        { icon: <MapPin size={32} />, title: "Total Convenience", desc: "Prime location near top dining, malls, and essentials for a seamless and convenient stay." }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            whileHover={{ y: -10 }}
                            className="p-8 border border-theme-border hover:border-norden-gold-500 transition-all group bg-theme-bg"
                        >
                            <div className="text-norden-gold-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-serif text-theme-text mb-3">{feature.title}</h3>
                            <p className="text-theme-muted text-sm leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </Section>

            {/* How It Works - The Process */}
            <Section>
                <div className="text-center mb-20">
                    <span className="text-norden-gold-500 uppercase tracking-widest text-sm font-bold">Seamless Living</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-theme-text mt-4">The Norden Suites Journey</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-[1px] bg-theme-border z-0"></div>

                    {[
                        { icon: <MapPin size={32} />, title: "1. Fine Living", desc: "Prime city location near luxury malls and amenities with secure, ample on-site parking." },
                        { icon: <Headset size={32} />, title: "2. Personal Concierge", desc: "Your dedicated point of contact for bookings and bespoke needs." },
                        { icon: <Clock size={32} />, title: "3. 24/7 Security", desc: "Professional on-site security for total peace of mind." }
                    ].map((item, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-norden-gold-500 text-norden-dark-900 flex items-center justify-center rounded-full mb-6 shadow-lg">
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-serif text-theme-text mb-4">{item.title}</h3>
                            <p className="text-theme-muted">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>


            {/* Featured Suites */}
            <Section className="bg-theme-surface/50">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <span className="text-norden-gold-500 uppercase tracking-widest text-sm font-bold">Residences</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-theme-text mt-2">Executive Residences</h2>
                    </div>
                    <Button variant="outline" className="hidden md:block" onClick={() => openBooking()}>Book a Suite</Button>
                </div>

                <motion.div
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex gap-8 overflow-x-auto pb-12 snap-x scrollbar-hide"
                >
                    {rooms.map((room) => (
                        <motion.div
                            key={room.id}
                            variants={{
                                hidden: { opacity: 0, x: 20 },
                                visible: { opacity: 1, x: 0 }
                            }}
                        >
                            <RoomCard room={room} />
                        </motion.div>
                    ))}
                </motion.div>

                <div className="flex justify-center md:hidden">
                    <Button variant="outline" onClick={() => openBooking()}>Book a Suite</Button>
                </div>
            </Section>



        </div>
    );
};

export default Home;
