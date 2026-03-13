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
            image: 'https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=535,height=400,dpr=2/tour_img/5f2f37b57ea0c8471044c9117c25159b7989efba67a45153502af74e40c781b7.png',
            tag: 'SIGNATURE',
            icon: <Anchor size={20} />
        },
        {
            title: 'Nyali Beach Camels',
            description: 'A timeless coastal tradition. Enjoy a peaceful ride along the white sands of Nyali at sunrise or sunset.',
            image: 'https://www.sojournsafaris.co.ke/wp-content/uploads/2021/01/beach-activities-1024x683.jpg',
            tag: 'FAMILY',
            icon: <Sun size={20} />
        },
        {
            title: 'Marine Park Snorkeling',
            description: 'Dive into the protected warm waters of the Mombasa Marine National Park. Swim alongside turtles and vibrant coral reefs.',
            image: 'https://dynamic-media.tacdn.com/media/photo-o/30/0c/0a/28/caption.jpg?w=1400&h=1000&s=1',
            tag: 'ADVENTURE',
            icon: <Compass size={20} />
        },
        {
            title: 'Tsavo East Day Safari',
            description: 'Witness the "Red Elephants" of Tsavo. A dawn-to-dusk adventure into Kenya\'s largest national park, just a short drive away.',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRclUJUk26Rx9B37Os6H56RBxlOrc4XGY6THA&s',
            tag: 'WILDLIFE',
            icon: <Map size={20} />
        }
    ];

    return (
        <div className="bg-theme-bg min-h-screen transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative h-[80vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/images/IMG_7071.jpg"
                        alt="Mombasa Coastal Experience"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-norden-dark-900/40" />
                    <div className="absolute inset-0 bg-gradient-to-b from-norden-dark-900/60 via-transparent to-theme-bg" />
                </div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <span className="h-[1px] w-12 bg-norden-gold-500" />
                            <span className="text-norden-gold-500 uppercase tracking-[0.4em] text-xs font-extrabold">Curated Journeys</span>
                            <span className="h-[1px] w-12 bg-norden-gold-500" />
                        </div>

                        <h1 className="text-6xl md:text-8xl font-serif text-theme-text mb-8 tracking-tight drop-shadow-2xl">
                            The Spirit of <span className="italic text-norden-gold-500">Nyali</span>
                        </h1>

                        <p className="text-norden-dark-700 text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-2xl mx-auto shadow-sm">
                            Beyond the comfort of your residence lies the magic of the Swahili coast.
                            From ancient history to wild safaris, allow us to curate your perfect African journey.
                        </p>
                    </motion.div>
                </div>
            </div>

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
