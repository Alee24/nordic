import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import BookingWidget from '../components/ui/BookingWidget';
import RoomCard from '../components/ui/RoomCard';
import { Star, MapPin, ArrowRight, Utensils, Sparkles, Briefcase, Wifi, Coffee, Key, Headset, Clock, LogIn, Home as HomeIcon } from 'lucide-react';
import { Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import BookingFlowModal from '../components/booking/BookingFlowModal';

const Home = () => {
    const [inquiryOpened, setInquiryOpened] = useState(false);
    const rooms = [
        {
            id: 1,
            name: 'Executive Residence',
            description: 'Full 1-bedroom apartment with ergonomic workspace and kitchen.',
            price: 250,
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop'
        },
        {
            id: 2,
            name: 'Norden Penthouse',
            description: 'Duplex apartment with private terrace and meeting area.',
            price: 450,
            image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=2574&auto=format&fit=crop'
        },
        {
            id: 3,
            name: 'Studio Loft',
            description: 'Efficient luxury for the solo business traveler.',
            price: 180,
            image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2670&auto=format&fit=crop'
        },
    ];

    return (
        <div className="bg-theme-bg min-h-screen transition-colors duration-300">

            {/* Hero Section */}
            <div className="relative h-screen w-full overflow-hidden">
                {/* Background Image / Video */}
                <div className="absolute inset-0">
                    <img
                        /* src="/images/culinary_hero.jpg" */
                        src="https://baharibeach.net/wp-content/uploads/2024/12/BBH-121-scaled.jpg"
                        alt="Norden Suites - Ocean View"
                        className="w-full h-full object-cover"
                    />
                    {/* Darker overall overlay to ensure text visibility regardless of theme */}
                    <div className="absolute inset-0 bg-norden-dark-900/40" />
                    {/* Fixed dark gradient to protect white text in both themes - prevents washing out in light mode */}
                    <div className="absolute inset-0 bg-gradient-to-b from-norden-dark-900/60 via-transparent to-norden-dark-900/40" />
                </div>

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

                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif text-white mb-8 tracking-tight drop-shadow-2xl">
                            <span className="italic text-norden-gold-500">Excellence</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-gray-200 text-lg md:text-xl font-light mb-12 leading-relaxed drop-shadow-md">
                            NORDEN SUITES offers the freedom of a private high-end apartment with the
                            security and convenience of a professional concierge. Your home away from home.
                        </p>

                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            <Link to="/suites">
                                <Button className="bg-norden-gold-500 text-norden-dark-900">View Apartments</Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="text-white border-white/40 hover:bg-white hover:text-norden-dark-900"
                                onClick={() => setInquiryOpened(true)}
                            >
                                Long Stay Rates
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
                            <Briefcase size={20} />
                            <span className="uppercase tracking-widest text-sm font-bold">Work & Rest</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-theme-text mb-6">
                            Experience Freedom. <br /> <span className="text-gradient-gold italic">Hotel Soul.</span>
                        </h2>
                        <p className="text-theme-muted mb-6 leading-relaxed">
                            We’ve combined the best of both worlds. Every NORDEN SUITES residence is a fully-equipped home,
                            featuring a chef-grade kitchenette and a custom-designed ergonomic workspace,
                            all supported by our signature 24/7 concierge and housekeeping.
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-norden-gold-500/10 p-2 rounded-full">
                                    <Wifi size={18} className="text-norden-gold-500" />
                                </div>
                                <span className="text-sm">Gbps Fiber Internet</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-norden-gold-500/10 p-2 rounded-full">
                                    <Sparkles size={18} className="text-norden-gold-500" />
                                </div>
                                <span className="text-sm">On-site Laundry Service</span>
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
                                src="https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2070&auto=format&fit=crop"
                                /* src="/images/home.jpg" */
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
                        { icon: <Utensils size={32} />, title: "Designer Kitchen", desc: "Full Bosch appliance suite with marble countertops." },
                        { icon: <Briefcase size={32} />, title: "Executive Office", desc: "Herman Miller seating and 4K thunderbolt displays." },
                        { icon: <Sparkles size={32} />, title: "Daily Housekeeping", desc: "Immaculate maintenance while you attend to business." },
                        { icon: <Coffee size={32} />, title: "Resident Lounge", desc: "Private networking space with curated breakfast buffet." }
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
                        { icon: <Key size={32} />, title: "1. Keyless Arrival", desc: "Digital check-in and mobile keys ready before you land." },
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
                        <span className="text-norden-gold-500 uppercase tracking-widest text-sm font-bold">Residencies</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-theme-text mt-2">Executive Living</h2>
                    </div>
                    <Button variant="outline" className="hidden md:block">View All Apartments</Button>
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
                    <Button variant="outline">View All Apartments</Button>
                </div>
            </Section>

            {/* Essential Services Teaser */}
            <Section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Laundry */}
                    <Link to="/laundry" className="group relative h-[600px] overflow-hidden rounded-xl block">
                        <img
                            src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2671&auto=format&fit=crop"
                            alt="Laundry Services"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-theme-bg/40 group-hover:bg-theme-bg/60 transition-colors duration-500" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                            <Sparkles size={48} className="text-norden-gold-500 mb-6" />
                            <h3 className="text-4xl font-serif text-theme-text mb-4">Professional Laundry</h3>
                            <p className="text-theme-muted mb-8 max-w-xs">
                                Valet wet-cleaning and self-service facilities available 24/7 for all residents.
                            </p>
                            <Button variant="outline" className="text-theme-text border-theme-border hover:bg-theme-text hover:text-theme-bg">
                                View Services
                            </Button>
                        </div>
                    </Link>

                    {/* Residences */}
                    <Link to="/suites" className="group relative h-[600px] overflow-hidden rounded-xl block">
                        <img
                            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"
                            alt="Residences"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-theme-bg/40 group-hover:bg-theme-bg/60 transition-colors duration-500" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                            <HomeIcon size={48} className="text-norden-gold-500 mb-6" />
                            <h2 className="text-4xl font-serif text-theme-text mb-4">Premium Apartments</h2>
                            <p className="text-theme-muted mb-8 max-w-xs">
                                Discover our collection of fully-furnished luxury apartments for your next stay.
                            </p>
                            <Button variant="outline" className="text-theme-text border-theme-border hover:bg-theme-text hover:text-theme-bg">
                                Explore Suites
                            </Button>
                        </div>
                    </Link>
                </div>
            </Section>

            <BookingFlowModal opened={inquiryOpened} onClose={() => setInquiryOpened(false)} />
        </div>
    );
};

export default Home;
