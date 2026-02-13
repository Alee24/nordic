import React, { useState } from 'react';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Compass, Sun, Anchor, Map, Calendar, ArrowRight } from 'lucide-react';

const ExperiencesPage = () => {
    const experiences = [
        {
            title: 'Sunset Dhow Cruise',
            description: 'Sail the Indian Ocean on a traditional Swahili dhow. Sip on dawa cocktails as the sky turns gold over Old Town Mombasa.',
            image: 'http://sharemykenya.com/images/African_dhow.jpg',
            tag: 'SIGNATURE',
            icon: <Anchor size={20} />
        },
        {
            title: 'Nyali Beach Camels',
            description: 'A timeless coastal tradition. Enjoy a peaceful ride along the white sands of Nyali at sunrise or sunset.',
            image: 'https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=center,quality=60,width=450,height=450,dpr=2/tour_img/13af3dd10337bbce9a774cdb8ec9a3f9e525c53913f8e9b3b754b7eb6b8c8c68.jpeg',
            tag: 'FAMILY',
            icon: <Sun size={20} />
        },
        {
            title: 'Marine Park Snorkeling',
            description: 'Dive into the protected warm waters of the Mombasa Marine National Park. Swim alongside turtles and vibrant coral reefs.',
            image: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/15/b7/8f/7d.jpg',
            tag: 'ADVENTURE',
            icon: <Compass size={20} />
        },
        {
            title: 'Tsavo East Day Safari',
            description: 'Witness the "Red Elephants" of Tsavo. A dawn-to-dusk adventure into Kenya\'s largest national park, just a short drive away.',
            image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2070&auto=format&fit=crop',
            tag: 'WILDLIFE',
            icon: <Map size={20} />
        }
    ];

    return (
        <div className="bg-theme-bg min-h-screen pt-24 transition-colors duration-300">
            {/* Hero Text */}
            <Section className="pb-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 max-w-4xl mx-auto"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-[1px] w-12 bg-norden-gold-500"></div>
                        <span className="text-norden-gold-500 uppercase tracking-[0.2em] text-sm font-bold">Discover The Coast</span>
                        <div className="h-[1px] w-12 bg-norden-gold-500"></div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif text-theme-text mb-8">
                        The Spirit of <span className="italic text-norden-gold-500">Nyali</span>
                    </h1>
                    <p className="text-theme-muted text-lg md:text-xl leading-relaxed">
                        Beyond the comfort of your residence lies the magic of the Swahili coast.
                        From ancient history to wild safaris, allow us to curate your perfect African journey.
                    </p>
                </motion.div>
            </Section>

            {/* Experiences Grid */}
            <Section className="pt-0">
                <div className="grid grid-cols-1 gap-20">
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-20 items-center`}
                        >
                            {/* Image Side */}
                            <div className="flex-1 w-full lg:w-1/2 relative group">
                                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] shadow-2xl">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                    <img
                                        src={exp.image}
                                        alt={exp.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    {/* Floating Tag */}
                                    <div className="absolute bottom-6 left-6 z-20">
                                        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-lg">
                                            <span className="text-norden-gold-600">{exp.icon}</span>
                                            <span className="text-xs font-bold tracking-widest uppercase text-norden-dark-900">{exp.tag}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Decorative elements */}
                                <div className={`absolute -bottom-6 -right-6 w-24 h-24 border-2 border-norden-gold-500/30 rounded-full -z-10 hidden lg:block ${index % 2 === 1 ? 'left-auto right-[-24px]' : 'right-auto left-[-24px]'}`} />
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 w-full lg:w-1/2 space-y-6 text-center lg:text-left">
                                <h2 className="text-4xl md:text-5xl font-serif text-theme-text">{exp.title}</h2>
                                <p className="text-theme-muted text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                                    {exp.description}
                                </p>
                                <div className="pt-4 flex justify-center lg:justify-start">
                                    <Button
                                        variant="outline"
                                        className="group border-theme-border text-theme-text hover:bg-norden-gold-500 hover:text-white hover:border-norden-gold-500"
                                        rightSection={<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    >
                                        Inquire Concierge
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* CTA Section */}
            <Section className="pb-32">
                <div className="bg-norden-dark-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-5xl font-serif text-white">Create Your Own Story</h2>
                        <p className="text-gray-400 text-lg">
                            Our Experiences Team is on hand to design a custom itinerary for your stay.
                            From private chefs to helicopter tours, anything is possible.
                        </p>
                        <Button className="bg-norden-gold-500 text-norden-dark-900 font-bold px-10 py-4 h-auto text-lg hover:bg-white hover:text-norden-dark-900">
                            Contact Experiences Team
                        </Button>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default ExperiencesPage;
