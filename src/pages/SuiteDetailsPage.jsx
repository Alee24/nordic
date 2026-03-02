import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { suites, BOOKING_INFO } from '../data/suites';
import Section from '../components/ui/Section';
import {
    Wifi, Coffee, Tv, Car, Phone, Mail,
    ArrowLeft, Users, Maximize, MapPin, CheckCircle2,
    BedDouble, Eye, PhoneCall, Diamond, CalendarCheck
} from 'lucide-react';
import useBookingModalStore from '../store/useBookingModalStore';
import useCurrencyStore from '../store/useCurrencyStore';

const fadeIn = (dir = 0, delay = 0) => ({
    initial: { opacity: 0, x: dir, y: dir === 0 ? 20 : 0 },
    animate: { opacity: 1, x: 0, y: 0, transition: { duration: 0.7, delay, ease: 'easeOut' } },
});

const SuiteDetailsPage = () => {
    const { id } = useParams();
    const suite = suites.find(s => s.id === parseInt(id) || s.slug === id);
    const openBooking = useBookingModalStore(s => s.openBooking);
    const { formatPrice } = useCurrencyStore();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!suite) {
        return (
            <div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center text-theme-text p-4">
                <h2 className="text-3xl font-serif mb-4">Suite Not Found</h2>
                <Link to="/suites" className="text-norden-gold-500 flex items-center gap-2 hover:underline">
                    <ArrowLeft size={18} /> Back to Residences
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-theme-bg min-h-screen pt-24 transition-colors duration-300">

            {/* Hero Banner */}
            <div className="relative h-[50vh] min-h-[360px] overflow-hidden mb-16">
                <img
                    src={suite.image}
                    alt={suite.name}
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.5)' }}
                    onError={e => {
                        e.target.src = '/images/ent1.jpg';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-theme-bg" />

                {/* Back Button */}
                <Link
                    to="/suites"
                    className="absolute top-8 left-6 md:left-12 z-20 inline-flex items-center gap-2 text-white/80 hover:text-norden-gold-400 transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium tracking-wider uppercase">Back to Collection</span>
                </Link>

                {/* Badges */}
                <div className="absolute top-8 right-6 md:right-12 z-20 flex gap-3">
                    <span className="inline-block px-4 py-2 bg-norden-gold-500 text-norden-dark-900 text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                        {suite.badge}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                        <Eye size={11} /> {suite.type}
                    </span>
                </div>

                {/* Suite Name overlay */}
                <div className="absolute bottom-10 left-6 md:left-12 z-20">
                    <span className="text-norden-gold-400 text-xs font-black uppercase tracking-[0.3em] block mb-2">
                        Norden Suites · {suite.subtitle}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight italic">
                        {suite.name}
                    </h1>
                </div>
            </div>

            <Section className="py-0 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left / Main Content */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Stats Row */}
                        <motion.div {...fadeIn(0, 0)} className="flex flex-wrap gap-6">
                            {[
                                { icon: <BedDouble size={18} />, label: 'Bedrooms', value: suite.bedrooms },
                                { icon: <Users size={18} />, label: 'Guests', value: `Up to ${suite.capacity}` },
                                { icon: <Maximize size={18} />, label: 'Size', value: suite.size },
                                { icon: <MapPin size={18} />, label: 'View', value: suite.view },
                            ].map((stat, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-theme-surface border border-theme-border">
                                    <div className="text-norden-gold-500">{stat.icon}</div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-theme-muted font-bold">{stat.label}</p>
                                        <p className="text-theme-text font-semibold text-sm">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Description */}
                        <motion.div {...fadeIn(0, 0.1)}>
                            <p className="text-theme-text/80 text-lg leading-relaxed font-light">
                                {suite.longDescription}
                            </p>
                        </motion.div>

                        {/* Image Gallery */}
                        <motion.div {...fadeIn(0, 0.15)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {suite.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                                    <img
                                        src={img}
                                        alt={`${suite.name} — view ${idx + 1}`}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                        onError={e => {
                                            e.target.src = '/images/sitting1.jpg';
                                        }}
                                    />
                                </div>
                            ))}
                        </motion.div>

                        {/* Amenities */}
                        <motion.div {...fadeIn(0, 0.2)}>
                            <div className="flex items-center gap-3 mb-6">
                                <Diamond size={18} className="text-norden-gold-500" />
                                <h2 className="text-2xl font-serif text-theme-text">Guest Amenities</h2>
                            </div>
                            <p className="text-theme-muted text-sm mb-6">
                                Every Norden Suites residence comes complete with the following premium amenities, included in your stay.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {suite.amenities.map((amenity, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.04 }}
                                        className="flex items-start gap-3 p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-norden-gold-500/30 transition-colors duration-300 group"
                                    >
                                        <CheckCircle2 size={16} className="text-norden-gold-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="text-sm text-theme-text/80 font-medium">{amenity}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Tech Icons */}
                        <motion.div {...fadeIn(0, 0.25)} className="pt-8 border-t border-theme-border">
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-theme-muted mb-6">In Every Suite</h3>
                            <div className="flex gap-8">
                                {[
                                    { icon: <Wifi size={22} />, label: 'Free Wi-Fi' },
                                    { icon: <Coffee size={22} />, label: 'Coffee & Tea' },
                                    { icon: <Tv size={22} />, label: 'QLED TV' },
                                    { icon: <Car size={22} />, label: 'Free Parking' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-3 group">
                                        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border group-hover:border-norden-gold-500 group-hover:text-norden-gold-500 transition-all duration-300">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-theme-muted group-hover:text-norden-gold-500 transition-colors duration-300">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Sidebar — Pricing & Contact */}
                    <div className="space-y-6 lg:sticky lg:top-28 self-start">

                        {/* Price Card */}
                        <motion.div {...fadeIn(20, 0)} className="p-8 rounded-2xl bg-theme-surface border border-theme-border shadow-2xl">
                            <p className="text-xs text-theme-muted uppercase tracking-widest font-bold mb-1">2026 Rate</p>
                            <p className="text-4xl font-serif text-norden-gold-500 font-bold mb-1">
                                {formatPrice(suite.price)}
                            </p>
                            <p className="text-sm text-theme-muted mb-2">per room, per night · incl. VAT</p>
                            <div className="h-[1px] bg-theme-border my-5" />
                            <div className="space-y-3 text-sm text-theme-muted mb-6">
                                <div className="flex justify-between">
                                    <span>View</span>
                                    <span className="text-theme-text font-medium">{suite.view}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Bedrooms</span>
                                    <span className="text-theme-text font-medium">{suite.bedrooms}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Capacity</span>
                                    <span className="text-theme-text font-medium">Up to {suite.capacity} guests</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Size</span>
                                    <span className="text-theme-text font-medium">{suite.size}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => openBooking(suite)}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-norden-gold-500 hover:bg-norden-gold-400 text-norden-dark-900 font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-norden-gold-500/25 hover:scale-[1.02] cursor-pointer"
                            >
                                <CalendarCheck size={16} /> Reserve This Suite
                            </button>
                            <button
                                onClick={() => openBooking(suite)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 mt-3 rounded-xl text-norden-gold-500 font-bold text-sm border border-norden-gold-500/25 hover:bg-norden-gold-500/5 hover:border-norden-gold-500/50 transition-all duration-200 cursor-pointer"
                            >
                                <Mail size={14} /> Email Inquiry
                            </button>
                        </motion.div>

                        {/* Contact Info */}
                        <motion.div {...fadeIn(20, 0.1)} className="p-6 rounded-2xl bg-norden-gold-500/5 border border-norden-gold-500/20">
                            <div className="flex items-center gap-2 mb-4">
                                <PhoneCall size={16} className="text-norden-gold-500" />
                                <h3 className="text-sm font-bold text-norden-gold-500 tracking-wider uppercase">
                                    {BOOKING_INFO.contact.department}
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <a href={`tel:${BOOKING_INFO.contact.telephone.replace(/\s/g, '')}`}
                                    className="flex items-center gap-3 text-sm text-theme-text hover:text-norden-gold-500 transition-colors group">
                                    <Phone size={14} className="text-norden-gold-500" />
                                    {BOOKING_INFO.contact.telephone}
                                </a>
                                <a href={`mailto:${BOOKING_INFO.contact.email}`}
                                    className="flex items-center gap-3 text-sm text-theme-text hover:text-norden-gold-500 transition-colors group">
                                    <Mail size={14} className="text-norden-gold-500" />
                                    {BOOKING_INFO.contact.email}
                                </a>
                            </div>
                        </motion.div>

                        {/* Rate note */}
                        <motion.div {...fadeIn(20, 0.15)} className="p-5 rounded-xl bg-theme-surface border border-theme-border">
                            <p className="text-xs text-theme-muted leading-relaxed">
                                <span className="font-bold text-theme-text/70">Note: </span>
                                {BOOKING_INFO.note} {BOOKING_INFO.groupNote}
                            </p>
                        </motion.div>

                        {/* Back to all suites */}
                        <Link
                            to="/suites"
                            className="flex items-center gap-2 text-sm text-theme-muted hover:text-norden-gold-500 transition-colors group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            View All Residences
                        </Link>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default SuiteDetailsPage;
