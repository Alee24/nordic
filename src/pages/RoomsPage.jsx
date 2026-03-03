import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BedDouble, UtensilsCrossed, Sofa, Bath, Building2,
    ParkingCircle, X, ChevronLeft, ChevronRight, ZoomIn, CalendarCheck
} from 'lucide-react';
import useBookingModalStore from '../store/useBookingModalStore';

/* ─── Image catalogue ──────────────────────────────────────────────────── */
const categories = [
    {
        id: 'bedroom',
        label: 'Bedroom',
        icon: BedDouble,
        tagline: 'King-sized comfort, every night',
        images: [
            { src: '/images/bed1.jpg', caption: 'Master Bedroom – King Bed' },
            { src: '/images/bed2.jpg', caption: 'Premium Suite Bedroom' },
            { src: '/images/bed3.jpg', caption: 'Deluxe Twin Room' },
            { src: '/images/bed33.jpg', caption: 'Cosy Studio Bedroom' },
            { src: '/images/kingbed.jpg', caption: 'King Suite' },
            { src: '/images/stoolsbed1.jpg', caption: 'Bedside Detail' },
            { src: '/images/b11.jpg', caption: 'Superior Bedroom' },
            { src: '/images/b12.jpg', caption: 'Bedroom – Morning Light' },
            { src: '/images/b13.jpg', caption: 'Bedroom – Evening Ambience' },
            { src: '/images/b14.jpg', caption: 'Bedroom – Corner View' },
            { src: '/images/b15.jpg', caption: 'Bedroom – Wardrobe Detail' },
            { src: '/images/b16.jpg', caption: 'Bedroom – Reading Nook' },
            { src: '/images/b17.jpg', caption: 'Bedroom – Window View' },
            { src: '/images/bedview.jpeg', caption: 'Bedroom – Coastal View' },
            { src: '/images/bedviews.jpeg', caption: 'Bedroom – Ocean Panorama' },
            { src: '/images/bed2b.jpeg', caption: 'Bedroom – Twin Setup' },
            { src: '/images/bed2.jpeg', caption: 'Bedroom – Classic Layout' },
        ],
    },
    {
        id: 'living',
        label: 'Living Room',
        icon: Sofa,
        tagline: 'Expansive spaces to relax & unwind',
        images: [
            { src: '/images/living.jpg', caption: 'Open-plan Living Area' },
            { src: '/images/living5.jpg', caption: 'Living Room – Lounge' },
            { src: '/images/living13.jpg', caption: 'Living Room – TV Wall' },
            { src: '/images/Living14.jpg', caption: 'Living Room – Sofa Detail' },
            { src: '/images/living67.jpg', caption: 'Living Room – Evening' },
            { src: '/images/lining12.jpg', caption: 'Living Area – Natural Light' },
            { src: '/images/sitting1.jpg', caption: 'Sitting Room – Main View' },
            { src: '/images/sitting2.jpg', caption: 'Sitting Room – Side Angle' },
            { src: '/images/sitting 3.jpg', caption: 'Sitting Room – Full View' },
            { src: '/images/sitting7.jpg', caption: 'Sitting Room – Cosy Corner' },
            { src: '/images/couch.jpeg', caption: 'Premium Couch' },
            { src: '/images/chess.jpg', caption: 'Games & Lounge Area' },
            { src: '/images/coridor.jpeg', caption: 'Hallway' },
        ],
    },
    {
        id: 'kitchen',
        label: 'Kitchen',
        icon: UtensilsCrossed,
        tagline: 'Fully equipped chef-grade kitchenettes',
        images: [
            { src: '/images/kitchen1.png', caption: 'Modern Kitchenette – Full View' },
            { src: '/images/kitchen2.jpg', caption: 'Kitchen – Counter Detail' },
            { src: '/images/kitchen5.jpg', caption: 'Kitchenette – Appliance Suite' },
            { src: '/images/fridge.jpg', caption: 'Full-size Refrigerator' },
            { src: '/images/dining1.jpg', caption: 'Dining Area' },
            { src: '/images/dining1.jpeg', caption: 'Dining – Compact Layout' },
            { src: '/images/dining5.jpg', caption: 'Dining – Extended Table' },
            { src: '/images/dining9.jpg', caption: 'Dining – Morning Setup' },
            { src: '/images/dinning4.jpg', caption: 'Dining – Evening Ambience' },
            { src: '/images/dining33.jpeg', caption: 'Dining – Detail' },
        ],
    },
    {
        id: 'bathroom',
        label: 'Bathroom',
        icon: Bath,
        tagline: 'Spa-inspired bathrooms for total rejuvenation',
        images: [
            { src: '/images/bath1.png', caption: 'Luxury En-suite Bathroom' },
            { src: '/images/bath2.jpg', caption: 'Bathroom – Walk-in Shower' },
            { src: '/images/bath.jpeg', caption: 'Bathroom – Vanity' },
            { src: '/images/toilet.jpg', caption: 'Premium Toilet Suite' },
            { src: '/images/washroom.jpeg', caption: 'Washroom – Full View' },
        ],
    },
    {
        id: 'exterior',
        label: 'Exterior & Street',
        icon: Building2,
        tagline: 'Iconic Nyali Beach frontage',
        images: [
            { src: '/images/street1.png', caption: 'Building – Street View' },
            { src: '/images/street2.jpg', caption: 'Street – Ground Level' },
            { src: '/images/front1.jpg', caption: 'Main Entrance' },
            { src: '/images/door.jpg', caption: 'Entrance Door' },
            { src: '/images/door1.png', caption: 'Lobby Door' },
            { src: '/images/door2.jpg', caption: 'Unit Door Detail' },
            { src: '/images/ent1.png', caption: 'Entry Foyer' },
            { src: '/images/IMG_7071.jpg', caption: 'Exterior – Day View' },
            { src: '/images/IMG_7153.jpg', caption: 'Exterior – Afternoon' },
            { src: '/images/IMG_7156.jpg', caption: 'Exterior – Evening' },
            { src: '/images/IMG_7183.jpg', caption: 'Exterior – Sunset' },
            { src: '/images/IMG_7194.jpg', caption: 'Exterior – Night' },
            { src: '/images/IMG_7210.jpg', caption: 'Exterior – Detail' },
            { src: '/images/IMG_7212.jpg', caption: 'Exterior – Wide Angle' },
            { src: '/images/IMG_6922.jpg', caption: 'Building Facade' },
        ],
    },
    {
        id: 'parking',
        label: 'Parking',
        icon: ParkingCircle,
        tagline: 'Secure, covered parking on-site',
        images: [
            { src: '/images/parking1.jpg', caption: 'Parking Bay – Overview' },
            { src: '/images/parking2.jpg', caption: 'Parking – Covered Area' },
        ],
    },
];

/* ─── Lightbox ────────────────────────────────────────────────────────── */
const Lightbox = ({ images, startIndex, onClose }) => {
    const [current, setCurrent] = useState(startIndex);

    const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
    const next = () => setCurrent(i => (i + 1) % images.length);

    // keyboard nav
    React.useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
            >
                <X size={24} />
            </button>

            {/* Image */}
            <div
                className="relative z-10 max-w-6xl w-full mx-4"
                onClick={e => e.stopPropagation()}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={current}
                        src={images[current].src}
                        alt={images[current].caption}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                    />
                </AnimatePresence>

                {/* Caption */}
                <p className="text-center text-white/60 mt-4 text-sm tracking-wide">
                    {images[current].caption} &nbsp;
                    <span className="text-white/30">
                        {current + 1} / {images.length}
                    </span>
                </p>

                {/* Prev / Next */}
                <button
                    onClick={prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                >
                    <ChevronLeft size={28} />
                </button>
                <button
                    onClick={next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                >
                    <ChevronRight size={28} />
                </button>
            </div>

            {/* Thumbnails strip */}
            <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2 overflow-x-auto px-4">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                        className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${i === current ? 'border-norden-gold-500 scale-110' : 'border-transparent opacity-50 hover:opacity-80'}`}
                    >
                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

/* ─── Category Section ────────────────────────────────────────────────── */
const CategorySection = ({ cat, index }) => {
    const [lightbox, setLightbox] = useState(null); // null | number
    const Icon = cat.icon;

    return (
        <section id={cat.id} className="py-20 border-b border-theme-border last:border-none">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex items-center gap-5 mb-12"
            >
                <div className="w-14 h-14 bg-norden-gold-500/10 border border-norden-gold-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={26} className="text-norden-gold-500" />
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-serif text-theme-text leading-tight">{cat.label}</h2>
                    <p className="text-theme-muted text-sm mt-1">{cat.tagline}</p>
                </div>
                <div className="ml-auto hidden md:block">
                    <span className="text-norden-gold-500/40 text-6xl font-serif font-bold leading-none">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                </div>
            </motion.div>

            {/* Masonry-style grid */}
            <motion.div
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3"
            >
                {cat.images.map((img, i) => (
                    <motion.div
                        key={i}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg"
                        onClick={() => setLightbox(i)}
                    >
                        <img
                            src={img.src}
                            alt={img.caption}
                            className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                        />
                        {/* hover overlay */}
                        <div className="absolute inset-0 bg-norden-dark-900/0 group-hover:bg-norden-dark-900/50 transition-all duration-400 flex items-center justify-center">
                            <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                        </div>
                        {/* caption bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-white text-xs truncate">{img.caption}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox !== null && (
                    <Lightbox
                        images={cat.images}
                        startIndex={lightbox}
                        onClose={() => setLightbox(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};

/* ─── Main Page ───────────────────────────────────────────────────────── */
const RoomsPage = () => {
    const openBooking = useBookingModalStore(s => s.openBooking);
    const [activeTab, setActiveTab] = useState('all');

    const filtered = activeTab === 'all' ? categories : categories.filter(c => c.id === activeTab);

    return (
        <div className="bg-theme-bg min-h-screen transition-colors duration-300">

            {/* ── Hero Banner ─────── */}
            <div className="relative h-[55vh] md:h-[65vh] overflow-hidden">
                <img
                    src="/images/front1.jpg"
                    alt="Norden Suites Rooms"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-norden-dark-900/70 via-norden-dark-900/30 to-norden-dark-900/70" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-norden-gold-500 uppercase tracking-[0.4em] text-xs font-bold">
                            Norden Suites • Nyali Beach
                        </span>
                        <h1 className="text-5xl md:text-7xl font-serif text-white mt-4 mb-6 drop-shadow-2xl">
                            Inside Our <span className="italic text-norden-gold-500">Residences</span>
                        </h1>
                        <p className="text-white/70 max-w-xl mx-auto text-lg mb-8">
                            Every corner crafted for comfort — explore our fully-furnished residences room by room.
                        </p>
                        <button
                            onClick={() => openBooking()}
                            className="inline-flex items-center gap-2 bg-norden-gold-500 text-norden-dark-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform uppercase text-sm tracking-widest shadow-lg shadow-norden-gold-500/30"
                        >
                            <CalendarCheck size={16} /> Book Your Stay
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* ── Sticky Category Tabs ─────── */}
            <div className="sticky top-[60px] z-40 bg-theme-bg/95 backdrop-blur-xl border-b border-theme-border shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'all'
                                ? 'bg-norden-gold-500 text-norden-dark-900'
                                : 'text-theme-muted hover:text-theme-text'
                                }`}
                        >
                            All Areas
                        </button>
                        {categories.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === cat.id
                                        ? 'bg-norden-gold-500 text-norden-dark-900'
                                        : 'text-theme-muted hover:text-theme-text'
                                        }`}
                                >
                                    <Icon size={13} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Gallery Sections ─────── */}
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        {filtered.map((cat, i) => (
                            <CategorySection key={cat.id} cat={cat} index={i} />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── CTA Strip ─────── */}
            <div className="bg-norden-dark-900 py-16 mt-8">
                <div className="max-w-3xl mx-auto text-center px-6">
                    <span className="text-norden-gold-500 uppercase tracking-widest text-xs font-bold">Ready to stay?</span>
                    <h2 className="text-4xl font-serif text-white mt-3 mb-4">
                        Experience it <span className="italic text-norden-gold-500">in person</span>
                    </h2>
                    <p className="text-white/50 mb-8">
                        Reserve your suite today and enjoy all amenities shown — fully furnished, fully serviced.
                    </p>
                    <button
                        onClick={() => openBooking()}
                        className="inline-flex items-center gap-2 bg-norden-gold-500 text-norden-dark-900 font-bold px-10 py-4 rounded-full hover:scale-105 transition-transform uppercase text-sm tracking-widest shadow-xl shadow-norden-gold-500/20"
                    >
                        <CalendarCheck size={18} /> Book Now
                    </button>
                </div>
            </div>

        </div>
    );
};

export default RoomsPage;
