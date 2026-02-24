import React, { useState } from 'react';
import Section from '../components/ui/Section';
import { motion, AnimatePresence } from 'framer-motion';
import { suites, GUEST_AMENITIES, BOOKING_INFO } from '../data/suites';
import {
    Wifi, Coffee, Tv, Car, Phone, Mail, Users, Maximize, MapPin,
    CheckCircle2, ArrowRight, Utensils, Droplets, Wind, Star,
    ChevronDown, BedDouble, Eye, PhoneCall, Building2, CalendarCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import useBookingModalStore from '../store/useBookingModalStore';

/* ── animation helpers ─────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

/* ── amenity icon map ───────────────────────────── */
const amenityIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes('wifi') || l.includes('internet')) return <Wifi size={16} />;
    if (l.includes('kitchen') || l.includes('crockeries') || l.includes('cooking') || l.includes('gas')) return <Utensils size={16} />;
    if (l.includes('fridge')) return <Droplets size={16} />;
    if (l.includes('tv')) return <Tv size={16} />;
    if (l.includes('coffee') || l.includes('tea')) return <Coffee size={16} />;
    if (l.includes('water')) return <Droplets size={16} />;
    if (l.includes('parking')) return <Car size={16} />;
    if (l.includes('lift')) return <Building2 size={16} />;
    return <CheckCircle2 size={16} />;
};

/* ── rate card rows ─────────────────────────────── */
const rateRows = suites.map(s => ({
    name: s.name,
    subtitle: s.subtitle,
    price: s.price,
    id: s.id,
}));

/* ══════════════════════════════════════════════════ */
const SuitesPage = () => {
    const [activeId, setActiveId] = useState(null);
    const [expandedAmenities, setExpandedAmenities] = useState(false);
    const openBooking = useBookingModalStore(s => s.openBooking);

    const activeSuite = suites.find(s => s.id === activeId) || suites[0];

    return (
        <div className="bg-theme-bg min-h-screen transition-colors duration-300">

            {/* ── HERO ──────────────────────────────────────── */}
            <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop"
                    alt="Norden Suites — Luxury Residences"
                    className="w-full h-full object-cover scale-105"
                    style={{ filter: 'brightness(0.55)' }}
                />
                {/* Gold gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-norden-dark-900/90" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
                        <div className="flex items-center justify-center gap-4 mb-5">
                            <span className="h-[1px] w-16 bg-norden-gold-500" />
                            <span className="text-norden-gold-400 uppercase tracking-[0.4em] text-xs font-extrabold">
                                Nyali Beach · Mombasa
                            </span>
                            <span className="h-[1px] w-16 bg-norden-gold-500" />
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight">
                            Luxury <span className="italic text-norden-gold-400">Residences</span>
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl mx-auto mb-8 leading-relaxed">
                            Fully serviced luxury suites designed for extraordinary living — where every detail celebrates comfort and elegance.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-norden-gold-500/10 backdrop-blur-md border border-norden-gold-500/30 rounded-full px-6 py-3">
                            <Star size={14} className="text-norden-gold-400 fill-norden-gold-400" />
                            <span className="text-norden-gold-300 text-sm font-semibold tracking-wider">2026 RATE CARD — FROM KES 12,000 / NIGHT</span>
                            <Star size={14} className="text-norden-gold-400 fill-norden-gold-400" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── 2026 RATE CARD TABLE ──────────────────────── */}
            <Section className="py-20">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <motion.div variants={fadeUp} className="text-center mb-14">
                        <span className="text-norden-gold-500 uppercase tracking-[0.35em] text-xs font-black block mb-3">
                            Official Pricing
                        </span>
                        <h2 className="text-4xl md:text-6xl font-serif text-theme-text">
                            2026 <span className="italic text-norden-gold-500">Rate Card</span>
                        </h2>
                        <p className="text-theme-muted mt-4 max-w-xl mx-auto text-sm leading-relaxed">
                            {BOOKING_INFO.note}
                        </p>
                    </motion.div>

                    {/* Rate Table */}
                    <motion.div variants={fadeUp} className="max-w-3xl mx-auto">
                        <div className="rounded-2xl overflow-hidden border border-theme-border shadow-2xl">
                            {/* Table Head */}
                            <div className="grid grid-cols-2 bg-norden-gold-500 text-norden-dark-900">
                                <div className="px-8 py-5 font-black uppercase tracking-widest text-sm">
                                    Apartment Type
                                </div>
                                <div className="px-8 py-5 font-black uppercase tracking-widest text-sm text-right">
                                    Rate / Night
                                </div>
                            </div>

                            {/* Table Rows */}
                            {rateRows.map((row, idx) => {
                                const suite = suites.find(s => s.id === row.id);
                                const isActive = activeId === row.id;
                                return (
                                    <motion.div
                                        key={row.id}
                                        whileHover={{ x: 6 }}
                                        onClick={() => setActiveId(isActive ? null : row.id)}
                                        className={`grid grid-cols-2 cursor-pointer transition-all duration-300 border-b border-theme-border last:border-b-0 group
                                            ${idx % 2 === 0 ? 'bg-theme-bg' : 'bg-theme-surface'}
                                            ${isActive ? 'ring-2 ring-inset ring-norden-gold-500 bg-norden-gold-500/5' : 'hover:bg-theme-surface/80'}`}
                                    >
                                        <div className="px-8 py-6">
                                            <p className={`font-semibold text-base transition-colors duration-200 ${isActive ? 'text-norden-gold-500' : 'text-theme-text group-hover:text-norden-gold-500'}`}>
                                                {row.name}
                                            </p>
                                            <p className="text-theme-muted text-sm font-medium mt-0.5">{row.subtitle}</p>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-3 flex items-center gap-3 flex-wrap"
                                                >
                                                    <span className="inline-flex items-center gap-1 text-xs text-norden-gold-500 bg-norden-gold-500/10 border border-norden-gold-500/20 rounded-full px-3 py-1">
                                                        <BedDouble size={11} /> {suite.bedrooms} BR
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs text-theme-muted bg-theme-surface border border-theme-border rounded-full px-3 py-1">
                                                        <Eye size={11} /> {suite.view}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs text-theme-muted bg-theme-surface border border-theme-border rounded-full px-3 py-1">
                                                        <Users size={11} /> Up to {suite.capacity}
                                                    </span>
                                                    <Link
                                                        to={`/suite/${suite.id}`}
                                                        onClick={e => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1 text-xs text-norden-gold-500 hover:text-norden-gold-400 font-semibold mt-1"
                                                    >
                                                        View Details <ArrowRight size={11} />
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="px-8 py-6 flex items-center justify-end">
                                            <div className="text-right">
                                                <p className={`text-lg font-bold font-serif transition-colors duration-200
                                                    ${isActive ? 'text-norden-gold-500' : 'text-theme-text group-hover:text-norden-gold-500'}`}>
                                                    KES {row.price.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-theme-muted mt-0.5">per night · incl. VAT</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-theme-muted text-center mt-4">
                            Click any row to see details · Rates are per room per night, inclusive of VAT
                        </p>
                    </motion.div>
                </motion.div>
            </Section>

            {/* ── SUITE CARDS GRID ─────────────────────────── */}
            <Section className="py-10 pt-0">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <motion.div variants={fadeUp} className="text-center mb-14">
                        <span className="text-norden-gold-500 uppercase tracking-[0.35em] text-xs font-black block mb-3">Our Collection</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-theme-text">
                            Discover Your <span className="italic text-norden-gold-500">Residence</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {suites.map((suite, idx) => (
                            <motion.div
                                key={suite.id}
                                variants={fadeUp}
                                whileHover={{ y: -10, scale: 1.01 }}
                                className="group relative overflow-hidden rounded-2xl shadow-2xl bg-theme-surface border border-theme-border cursor-pointer transition-all duration-500"
                                style={{ height: '500px' }}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={suite.image}
                                        alt={suite.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={e => {
                                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-norden-dark-900/95 via-norden-dark-900/40 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                </div>

                                {/* Badge */}
                                <div className="absolute top-5 left-5 z-10">
                                    <span className="inline-block px-3 py-1.5 bg-norden-gold-500 text-norden-dark-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                                        {suite.badge}
                                    </span>
                                </div>

                                {/* View type badge */}
                                <div className="absolute top-5 right-5 z-10">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                                        <Eye size={10} /> {suite.type}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BedDouble size={14} className="text-norden-gold-400" />
                                        <span className="text-norden-gold-400 text-xs font-bold uppercase tracking-widest">
                                            {suite.bedrooms} Bedroom{suite.bedrooms > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-serif text-white mb-1">{suite.name}</h3>
                                    <p className="text-norden-gold-300 text-sm font-medium mb-3">{suite.subtitle}</p>
                                    <p className="text-gray-300 text-xs mb-5 line-clamp-2 leading-relaxed">{suite.description}</p>

                                    {/* Amenity icons */}
                                    <div className="flex gap-3 mb-5 text-norden-gold-400">
                                        <Wifi size={16} title="Free Wi-Fi" />
                                        <Utensils size={16} title="Full Kitchen" />
                                        <Tv size={16} title="QLED TV" />
                                        <Coffee size={16} title="Coffee & Tea" />
                                        <Car size={16} title="Free Parking" />
                                    </div>

                                    {/* Price & CTA */}
                                    <div className="flex justify-between items-center transition-all duration-300 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">From</p>
                                            <p className="text-xl font-bold text-white font-serif">
                                                KES {suite.price.toLocaleString()}
                                                <span className="text-xs font-normal text-gray-300 ml-1">/ night</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => openBooking(suite)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-norden-gold-500 hover:bg-norden-gold-400 text-norden-dark-900 text-sm font-bold rounded-full transition-all duration-200 shadow-lg hover:shadow-norden-gold-500/30"
                                        >
                                            Book Now <CalendarCheck size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </Section>

            {/* ── GUEST AMENITIES ──────────────────────────── */}
            <Section className="py-20 bg-theme-surface/40">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <motion.div variants={fadeUp} className="text-center mb-14">
                        <span className="text-norden-gold-500 uppercase tracking-[0.35em] text-xs font-black block mb-3">
                            Included in Every Suite
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-theme-text">
                            Guest <span className="italic text-norden-gold-500">Amenities</span>
                        </h2>
                        <p className="text-theme-muted mt-4 max-w-xl mx-auto text-sm">
                            Every residence at Norden Suites comes fully equipped with the following premium amenities — at no additional cost.
                        </p>
                    </motion.div>

                    <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
                        {GUEST_AMENITIES.map((amenity, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeUp}
                                whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.5)' }}
                                className="flex items-start gap-3 p-5 bg-theme-bg rounded-xl border border-theme-border hover:border-norden-gold-500/40 transition-all duration-300 group"
                            >
                                <div className="text-norden-gold-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                                    {amenityIcon(amenity)}
                                </div>
                                <span className="text-theme-text text-sm leading-relaxed font-medium">{amenity}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Icon Legend Row */}
                    <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-8 mt-14 pt-10 border-t border-theme-border">
                        {[
                            { icon: <Wifi size={22} />, label: 'High Speed Wi-Fi' },
                            { icon: <Utensils size={22} />, label: 'Full Kitchen' },
                            { icon: <Tv size={22} />, label: 'QLED TV' },
                            { icon: <Coffee size={22} />, label: 'Complimentary Coffee' },
                            { icon: <Car size={22} />, label: 'Free Parking' },
                            { icon: <Building2 size={22} />, label: 'Lift Access' },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -6 }}
                                className="flex flex-col items-center gap-3 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-theme-surface border border-theme-border group-hover:border-norden-gold-500 group-hover:text-norden-gold-500 text-theme-muted flex items-center justify-center transition-all duration-300">
                                    {item.icon}
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-theme-muted group-hover:text-norden-gold-500 transition-colors duration-300">
                                    {item.label}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </Section>

            {/* ── BOOKING PROCEDURES ───────────────────────── */}
            <Section className="py-20">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <motion.div variants={fadeUp} className="text-center mb-14">
                        <span className="text-norden-gold-500 uppercase tracking-[0.35em] text-xs font-black block mb-3">
                            How to Book
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-theme-text">
                            Booking <span className="italic text-norden-gold-500">Procedures</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Info Card */}
                        <motion.div
                            variants={fadeUp}
                            className="p-8 rounded-2xl bg-theme-surface border border-theme-border"
                        >
                            <div className="w-12 h-12 rounded-xl bg-norden-gold-500/10 border border-norden-gold-500/20 flex items-center justify-center mb-6">
                                <Star size={20} className="text-norden-gold-500" />
                            </div>
                            <h3 className="text-xl font-serif text-theme-text mb-4">Individual Bookings</h3>
                            <p className="text-theme-muted text-sm leading-relaxed">
                                {BOOKING_INFO.note}
                            </p>
                            <div className="mt-4 p-4 rounded-xl bg-norden-gold-500/5 border border-norden-gold-500/15">
                                <p className="text-theme-muted text-xs leading-relaxed">
                                    {BOOKING_INFO.groupNote}
                                </p>
                            </div>
                        </motion.div>

                        {/* Contact Card */}
                        <motion.div
                            variants={fadeUp}
                            className="p-8 rounded-2xl bg-norden-gold-500/5 border border-norden-gold-500/20"
                        >
                            <div className="w-12 h-12 rounded-xl bg-norden-gold-500/20 border border-norden-gold-500/30 flex items-center justify-center mb-6">
                                <PhoneCall size={20} className="text-norden-gold-500" />
                            </div>
                            <h3 className="text-xl font-serif text-norden-gold-500 mb-2">
                                {BOOKING_INFO.contact.department}
                            </h3>
                            <p className="text-theme-muted text-xs uppercase tracking-widest font-bold mb-6">Get in Touch</p>

                            <div className="space-y-4">
                                <a
                                    href={`tel:${BOOKING_INFO.contact.telephone.replace(/\s/g, '')}`}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-norden-gold-500/10 border border-norden-gold-500/20 flex items-center justify-center group-hover:bg-norden-gold-500 group-hover:border-norden-gold-500 transition-all duration-300">
                                        <Phone size={16} className="text-norden-gold-500 group-hover:text-norden-dark-900 transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-theme-muted">Telephone</p>
                                        <p className="text-theme-text font-semibold group-hover:text-norden-gold-500 transition-colors duration-200">
                                            {BOOKING_INFO.contact.telephone}
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href={`mailto:${BOOKING_INFO.contact.email}`}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-norden-gold-500/10 border border-norden-gold-500/20 flex items-center justify-center group-hover:bg-norden-gold-500 group-hover:border-norden-gold-500 transition-all duration-300">
                                        <Mail size={16} className="text-norden-gold-500 group-hover:text-norden-dark-900 transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-theme-muted">Email Address</p>
                                        <p className="text-theme-text font-semibold group-hover:text-norden-gold-500 transition-colors duration-200">
                                            {BOOKING_INFO.contact.email}
                                        </p>
                                    </div>
                                </a>
                            </div>

                            <div className="mt-8 pt-6 border-t border-norden-gold-500/20 flex gap-3">
                                <button
                                    onClick={() => openBooking()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-norden-gold-500 hover:bg-norden-gold-400 text-norden-dark-900 text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-norden-gold-500/25"
                                >
                                    <CalendarCheck size={14} /> Book Now
                                </button>
                                <button
                                    onClick={() => openBooking()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-transparent hover:bg-norden-gold-500/10 text-norden-gold-500 text-sm font-bold border border-norden-gold-500/30 hover:border-norden-gold-500 transition-all duration-200"
                                >
                                    <Mail size={14} /> Enquire
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </Section>

            {/* ── CTA BANNER ───────────────────────────────── */}
            <div className="relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1629794226066-349748040fb7?q=80&w=2070&auto=format&fit=crop"
                    alt="Norden Suites"
                    className="w-full h-[400px] object-cover"
                    style={{ filter: 'brightness(0.35)' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="text-norden-gold-400 uppercase tracking-[0.4em] text-xs font-black block mb-4">
                            Reserve Your Stay
                        </span>
                        <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">
                            Begin Your <span className="italic text-norden-gold-400">Norden</span> Experience
                        </h2>
                        <p className="text-gray-300 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
                            Contact our Reservations Department today and let our team curate the perfect luxury residence for your stay.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => openBooking()}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-norden-gold-500 hover:bg-norden-gold-400 text-norden-dark-900 font-bold rounded-full transition-all duration-200 shadow-xl hover:shadow-norden-gold-500/30 hover:scale-105"
                            >
                                <CalendarCheck size={16} /> Reserve Your Suite
                            </button>
                            <button
                                onClick={() => openBooking()}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border border-white/20 hover:border-white/40 transition-all duration-200"
                            >
                                <Mail size={16} /> Make an Enquiry
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default SuitesPage;
