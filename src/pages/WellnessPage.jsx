import React from 'react';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Waves, Heart, Leaf } from 'lucide-react';

const WellnessPage = () => {
    const beachImages = [
        {
            url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=2574&auto=format&fit=crop",
            caption: "Sunrise Yoga on Nyali Beach"
        },
        {
            url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
            caption: "Relaxing in the Tropical Breeze"
        },
        {
            url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=2070&auto=format&fit=crop",
            caption: "Sunset Meditation by the Indian Ocean"
        }
    ];

    const [current, setCurrent] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % beachImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [beachImages.length]);

    return (
        <div className="bg-theme-bg min-h-screen pt-20 transition-colors duration-300">
            {/* Animated Hero Carousel */}
            <div className="relative h-[70vh] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={beachImages[current].url}
                            alt={beachImages[current].caption}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-theme-bg/40 backdrop-blur-[1px]" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-norden-gold-500 uppercase tracking-[0.4em] text-sm mb-4"
                            >
                                Serenity at Nyali
                            </motion.span>
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="text-6xl md:text-8xl font-serif text-theme-text mb-4"
                            >
                                Ocean Soul
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-theme-muted italic text-xl"
                            >
                                {beachImages[current].caption}
                            </motion.p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Carousel Indicators */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {beachImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-1 transition-all duration-500 ${current === idx ? 'w-12 bg-norden-gold-500' : 'w-6 bg-white/30'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">
                    {[
                        { icon: <Waves size={32} />, title: "Ocean Hydrotherapy", desc: "Mineral-rich treatments using purified Indian Ocean water." },
                        { icon: <Leaf size={32} />, title: "Tropical Botanicals", desc: "Local Kenyan oils and herbs for holistic healing." },
                        { icon: <Heart size={32} />, title: "Beachside Yoga", desc: "Sunrise and sunset sessions on the white sands of Nyali." },
                        { icon: <Sparkles size={32} />, title: "Private Spa Suite", desc: "En-suite treatments for total privacy and seclusion." }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="bg-theme-surface p-8 rounded-xl text-center border border-theme-border hover:border-norden-gold-500 transition-all"
                        >
                            <div className="text-norden-gold-500 mb-6 flex justify-center">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-serif text-theme-text mb-4">{feature.title}</h3>
                            <p className="text-theme-muted text-sm leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-12">
                    <div className="w-16 h-px bg-norden-gold-500 mb-8" />
                    <h2 className="text-4xl md:text-5xl font-serif text-theme-text mb-6 italic">African Hospitality. <br /><span className="not-italic">Pure Serenity.</span></h2>
                    <p className="text-theme-muted mb-12 text-lg">
                        Our wellness philosophy integrates ancient African healing traditions with modern luxury techniques.
                        Experience the gentle rhythm of the coast.
                    </p>
                    <Button variant="outline" className="px-12 py-4">View Holistic Menu</Button>
                </div>
            </Section>
        </div>
    );
};

export default WellnessPage;
