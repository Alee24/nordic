import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu as BurgerIcon,
    X,
    ChevronDown,
    Home,
    Utensils,
    Compass,
    Key,
    LogIn,
    MessageSquare,
    User,
    Calendar,
    Sparkles
} from 'lucide-react';
import { Menu, Button, Group, Text, Box, Indicator, ActionIcon } from '@mantine/core';
import ThemeToggle from './ThemeToggle';
import BookingFlowModal from '../booking/BookingFlowModal';

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [inquiryOpened, setInquiryOpened] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-theme-bg/95 backdrop-blur-xl py-3 shadow-2xl border-b border-theme-border'
                : 'bg-transparent py-6 border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="group flex items-center gap-3 z-50">
                    <div className="w-10 h-10 bg-norden-gold-500 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-lg shadow-norden-gold-500/20">
                        <span className="text-norden-dark-900 font-bold text-xl">N</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-xl font-serif font-bold tracking-[0.2em] leading-none drop-shadow-sm transition-colors duration-500 ${scrolled ? 'text-theme-text' : 'text-white'}`}>NORDEN</span>
                        <span className={`text-xl font-serif font-bold tracking-[0.2em] leading-none drop-shadow-sm transition-colors duration-500 ${scrolled ? 'text-norden-gold-500' : 'text-norden-gold-500'}`}>SUITS</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-1">
                    <Button
                        variant="subtle"
                        component={Link}
                        to="/"
                        className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent transition-colors duration-300 ${isActive('/') ? '!text-norden-gold-500' : (scrolled ? '!text-theme-text' : 'text-white drop-shadow-md')
                            }`}
                    >
                        Home
                    </Button>

                    <Button
                        variant="subtle"
                        component={Link}
                        to="/suites"
                        className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent transition-colors duration-300 ${isActive('/suites') ? '!text-norden-gold-500' : (scrolled ? '!text-theme-text' : 'text-white drop-shadow-md')
                            }`}
                    >
                        Residences
                    </Button>

                    <Button
                        variant="subtle"
                        component={Link}
                        to="/experiences"
                        className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent transition-colors duration-300 ${isActive('/experiences') ? '!text-norden-gold-500' : (scrolled ? '!text-theme-text' : 'text-white drop-shadow-md')
                            }`}
                    >
                        Coastal Experience
                    </Button>

                    <Button
                        variant="subtle"
                        component={Link}
                        to="/laundry"
                        className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent transition-colors duration-300 ${isActive('/laundry') ? '!text-norden-gold-500' : (scrolled ? '!text-theme-text' : 'text-white drop-shadow-md')
                            }`}
                    >
                        Laundry
                    </Button>

                    <Button
                        variant="subtle"
                        component={Link}
                        to="/contact"
                        className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent transition-colors duration-300 ${isActive('/contact') ? '!text-norden-gold-500' : (scrolled ? '!text-theme-text' : 'text-white drop-shadow-md')
                            }`}
                    >
                        Contact
                    </Button>

                    <Box className="ml-6 flex items-center gap-4">
                        <ThemeToggle />
                        <Button
                            className="bg-norden-gold-500 text-norden-dark-900 font-bold px-8 rounded-full hover:scale-105 transition-transform uppercase text-xs tracking-widest"
                            size="md"
                            onClick={() => setInquiryOpened(true)}
                        >
                            Book Now
                        </Button>
                    </Box>
                </div>

                {/* Mobile Controls */}
                <div className="flex lg:hidden items-center gap-4">
                    <ThemeToggle />
                    <ActionIcon
                        variant="transparent"
                        className={`${scrolled ? 'text-theme-text' : 'text-white'} transition-colors duration-500`}
                        onClick={() => setIsOpen(!isOpen)}
                        size="xl"
                    >
                        {isOpen ? <X size={28} /> : <BurgerIcon size={28} />}
                    </ActionIcon>
                </div>

                {/* Mobile Nav Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 bg-theme-bg z-40 lg:hidden flex flex-col p-12 pt-32 gap-8"
                        >
                            <div className="space-y-8">
                                <Stack gap="md">
                                    <Link to="/" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-theme-text flex items-center gap-4"><Home /> Home</Link>
                                    <Link to="/suites" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-theme-text flex items-center gap-4"><Home /> Residences</Link>
                                    <Link to="/experiences" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-theme-text flex items-center gap-4"><Compass /> Experience</Link>
                                    <Link to="/laundry" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-theme-text flex items-center gap-4"><Sparkles /> Laundry</Link>
                                    <Link to="/contact" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-theme-text flex items-center gap-4"><MessageSquare /> Contact</Link>
                                </Stack>
                            </div>

                            <Button
                                fullWidth
                                size="xl"
                                className="bg-norden-gold-500 text-norden-dark-900 font-bold rounded-full mt-auto"
                                onClick={() => {
                                    setInquiryOpened(true);
                                    setIsOpen(false);
                                }}
                            >
                                Book Your Stay
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <BookingFlowModal opened={inquiryOpened} onClose={() => setInquiryOpened(false)} />
        </nav>
    );
};

// Helper for mobile stack
const Stack = ({ children, gap = 'md' }) => (
    <div className={`flex flex-col gap-${gap}`}>
        {children}
    </div>
);

export default Navigation;
