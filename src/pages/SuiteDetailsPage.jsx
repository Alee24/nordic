import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { suites } from '../data/suites';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { Wifi, Coffee, Tv, ArrowLeft, Users, Maximize, MapPin, CheckCircle2 } from 'lucide-react';

const SuiteDetailsPage = () => {
    const { id } = useParams();
    const suite = suites.find(s => s.id === parseInt(id) || s.slug === id);

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
            <Section className="py-12">
                {/* Back Button */}
                <Link
                    to="/suites"
                    className="inline-flex items-center gap-2 text-theme-text/60 hover:text-norden-gold-500 transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium tracking-wider uppercase">Back to Collection</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Side: Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-3xl">
                            <img
                                src={suite.image}
                                alt={suite.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 left-6">
                                <span className="bg-norden-dark-900/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs font-bold tracking-[0.2em] uppercase">
                                    Residency {suite.id}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {suite.images.slice(1).map((img, idx) => (
                                <div key={idx} className="relative aspect-square overflow-hidden rounded-2xl shadow-xl">
                                    <img
                                        src={img}
                                        alt={`${suite.name} detail ${idx + 1}`}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side: Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col justify-center"
                    >
                        <div className="mb-10">
                            <span className="text-norden-gold-500 uppercase tracking-[0.3em] text-xs font-black block mb-4">The Collection</span>
                            <h1 className="text-5xl md:text-7xl font-serif text-theme-text leading-tight mb-6 italic">
                                {suite.name}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-theme-text/60 mb-8">
                                <div className="flex items-center gap-2">
                                    <Maximize size={18} className="text-norden-gold-500" />
                                    <span className="text-sm">{suite.size}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-norden-gold-500" />
                                    <span className="text-sm">Up to {suite.capacity} Guests</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-norden-gold-500" />
                                    <span className="text-sm">{suite.view}</span>
                                </div>
                            </div>
                            <p className="text-xl text-theme-text/80 leading-relaxed font-light">
                                {suite.longDescription}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                            <div>
                                <h3 className="text-lg font-serif italic text-theme-text mb-6">Signature Amenities</h3>
                                <ul className="space-y-4">
                                    {suite.amenities.map((amenity, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <CheckCircle2 size={18} className="text-norden-gold-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-theme-text/70">{amenity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-8">
                                <div className="p-8 rounded-3xl bg-theme-surface border border-theme-border shadow-inner">
                                    <p className="text-sm text-theme-text/50 uppercase tracking-widest mb-1">Starting from</p>
                                    <p className="text-4xl font-serif text-norden-gold-600 font-bold mb-6">
                                        ${suite.price} <span className="text-lg font-normal text-theme-text/40 tracking-normal italic">/ night</span>
                                    </p>
                                    <Button
                                        onClick={() => notifications.show({ title: 'Booking Inquiry', message: 'Inquiry sent for ' + suite.name + '. Our concierge will contact you shortly.', color: 'gold' })}
                                        className="w-full !py-4"
                                    >
                                        Inquire Availability
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Tech Specs */}
                        <div className="pt-10 border-t border-theme-border">
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-theme-text/40 mb-6">Connected Residency</h3>
                            <div className="flex gap-10">
                                <div className="flex flex-col items-center gap-3 group">
                                    <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border group-hover:border-norden-gold-500 group-hover:text-norden-gold-500 transition-all duration-300">
                                        <Wifi size={24} />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-theme-text/50">Fiber WiFi</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 group">
                                    <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border group-hover:border-norden-gold-500 group-hover:text-norden-gold-500 transition-all duration-300">
                                        <Coffee size={24} />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-theme-text/50">Kitchenette</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 group">
                                    <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border group-hover:border-norden-gold-500 group-hover:text-norden-gold-500 transition-all duration-300">
                                        <Tv size={24} />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-theme-text/50">Smart TV</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Section>
        </div>
    );
};

export default SuiteDetailsPage;
