import React from 'react';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Utensils, ShoppingBag, ChefHat, Coffee, ArrowRight, Star, Sunrise } from 'lucide-react';
import { useMantineColorScheme, Text } from '@mantine/core';

const DiningPage = () => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <div className="bg-theme-bg min-h-screen transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative h-[85vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/images/culinary_hero.jpg"
                        alt="Luxury Beachfront Kitchen"
                        className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[10s]"
                    />
                    <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-black/60 backdrop-blur-[1px]' : 'bg-white/20 backdrop-blur-[1px]'
                        }`} />
                    <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${isDark ? 'from-norden-dark-900' : 'from-white'
                        }`} />
                </div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="h-px w-12 bg-norden-gold-500" />
                            <span className="text-norden-gold-500 uppercase tracking-[0.4em] text-xs md:text-sm font-bold">
                                The Culinary Suits
                            </span>
                            <div className="h-px w-12 bg-norden-gold-500" />
                        </div>

                        <h1 className={`text-6xl md:text-8xl font-serif mb-8 leading-tight transition-colors duration-500 ${isDark ? 'text-white' : 'text-norden-dark-900'
                            }`}>
                            Your Home. <br />
                            <span className="italic text-norden-gold-500">Your Kitchen.</span>
                        </h1>

                        <p className={`text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto mb-10 transition-colors duration-500 ${isDark ? 'text-gray-300' : 'text-norden-dark-700'
                            }`}>
                            Experience the freedom of a fully equipped chef's kitchen with breathtaking ocean views in every residence.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button className="bg-norden-gold-500 text-norden-dark-900 px-10 py-4 h-auto text-lg font-bold rounded-full">Explore Kitchens</Button>
                            <Button variant="outline" className={`px-10 py-4 h-auto text-lg font-bold rounded-full border-2 ${isDark ? 'text-white border-white/30 hover:bg-white/10' : 'text-black border-black/30 hover:bg-black/5'
                                }`}>Learn More</Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* The Private Kitchen Feature */}
            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            < sunrise className="text-norden-gold-500" size={32} />
                            <h2 className="text-4xl md:text-5xl font-serif text-theme-text">Create, Gather, Savor.</h2>
                        </div>
                        <p className="text-theme-muted text-xl mb-10 leading-relaxed font-light">
                            Every Norden Suits apartment features a state-of-the-art kitchen designed for those who love the art of cooking.
                            From marble islands to professional Bosch appliances, we provide everything needed for a five-star dining experience.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            {[
                                { title: "Bosch Performance", desc: "Full-size convection ovens & induction cooktops." },
                                { title: "Morning Rituals", desc: "Nespresso machines with curated coffee selections." },
                                { title: "Artisan Dining", desc: "Premium stoneware and designer crystal sets." },
                                { title: "Hosting Ready", desc: "Large dishwashers and integrated wine fridges." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-theme-surface transition-colors border border-transparent hover:border-theme-border">
                                    <div className="mt-1">
                                        <Star size={18} className="text-norden-gold-500 fill-norden-gold-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-theme-text mb-1">{item.title}</h4>
                                        <p className="text-theme-muted text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative">
                            <img
                                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
                                alt="Luxury Kitchen Detail"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                        {/* Decorative floating badge */}
                        <div className="absolute -bottom-10 -left-10 bg-norden-gold-500 text-norden-dark-900 p-8 rounded-full w-40 h-40 flex flex-col items-center justify-center text-center shadow-xl rotate-12 hidden md:flex">
                            <span className="text-xs uppercase font-bold tracking-widest">Skyline</span>
                            <span className="text-3xl font-serif font-bold italic">Views</span>
                        </div>
                    </motion.div>
                </div>
            </Section>

            {/* Services Grid */}
            <Section className="bg-theme-surface/30">
                <div className="text-center mb-20">
                    <span className="text-norden-gold-500 uppercase tracking-widest text-sm font-bold block mb-4">Resident Privileges</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-theme-text mb-6">Elevated Conveniences</h2>
                    <div className="w-24 h-1 bg-norden-gold-500 mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        {
                            icon: <ShoppingBag size={44} />,
                            title: "Pantry Stocking",
                            desc: "Arrive to a full fridge. Select your groceries via our app, and we'll have them perfectly arranged for you.",
                            action: "Discover Pantry"
                        },
                        {
                            icon: <ChefHat size={44} />,
                            title: "Private Chef",
                            desc: "Hosting a soirée? Our private chefs bring world-class coastal flavors directly to your residence.",
                            action: "Book a Chef"
                        },
                        {
                            icon: <Utensils size={44} />,
                            title: "Signature Dining",
                            desc: "Enjoy the menu of 'The Summit' from the comfort of your penthouse living room.",
                            action: "Full Menu"
                        }
                    ].map((service, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -15 }}
                            className="bg-theme-bg p-10 rounded-2xl border border-theme-border flex flex-col items-center text-center group transition-all hover:border-norden-gold-500 hover:shadow-2xl h-full"
                        >
                            <div className="mb-8 text-norden-gold-500 p-6 bg-norden-gold-500/10 rounded-2xl group-hover:bg-norden-gold-500 group-hover:text-norden-dark-900 transition-all duration-300 transform group-hover:rotate-6">
                                {service.icon}
                            </div>
                            <h3 className="text-3xl font-serif text-theme-text mb-6">{service.title}</h3>
                            <p className="text-theme-muted text-lg mb-10 flex-grow font-light leading-relaxed">{service.desc}</p>
                            <Button variant="outline" className="w-full py-4 font-bold border-2 rounded-xl group-hover:bg-norden-gold-500 group-hover:text-black group-hover:border-norden-gold-500">
                                {service.action}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* The Summit Table */}
            <Section>
                <div className="relative rounded-3xl overflow-hidden bg-norden-dark-900 text-white shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-12 md:p-24 flex flex-col justify-center relative z-10">
                            <span className="text-norden-gold-500 uppercase tracking-widest text-sm font-bold mb-6 block">Skyline Dining</span>
                            <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">The Summit Table</h2>
                            <p className="text-gray-300 text-xl mb-12 leading-relaxed font-light">
                                Perched on the 10th floor, The Summit celebrates the spirit of Mombasa with Michelin-inspired coastal fusion.
                                Spectacular ocean views meet unparalleled culinary artistry.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <Button className="bg-norden-gold-500 text-norden-dark-900 font-bold px-10 py-4 h-auto rounded-full hover:bg-white transition-colors">Reserve Excellence</Button>
                                <Button variant="outline" className="text-white border-white/30 hover:bg-white hover:text-black px-10 py-4 h-auto rounded-full border-2">Full Menu</Button>
                            </div>
                        </div>
                        <div className="relative h-[500px] lg:h-auto overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574&auto=format&fit=crop"
                                alt="Fine Dining"
                                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[10s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-norden-dark-900 via-transparent to-transparent hidden lg:block" />
                            <div className="absolute inset-0 bg-gradient-to-t from-norden-dark-900 via-transparent to-transparent lg:hidden" />
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default DiningPage;
