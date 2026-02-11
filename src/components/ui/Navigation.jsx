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
import DigitalKeyDisplay from '../booking/DigitalKeyDisplay';

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showKey, setShowKey] = useState(false);
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
                    <div className="w-10 h-10 bg-nordic-gold-500 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-lg shadow-nordic-gold-500/20">
                        <span className="text-nordic-dark-900 font-bold text-xl">N</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-serif font-bold text-theme-text tracking-[0.2em] leading-none drop-shadow-sm">NORDIC</span>
                        <span className="text-[10px] tracking-[0.4em] text-nordic-gold-500 font-bold uppercase drop-shadow-sm">Suites</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-1">
                    <Button
                        variant="subtle"
                        component={Link}
                        to="/"
                        className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent ${isActive('/') ? '!text-nordic-gold-500' : '!text-theme-text'
                            }`}
                    >
                        Home
                    </Button>

                    <Button
                        variant="subtle"
                        component={Link}
                        to="/suites"
                        className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent ${isActive('/suites') ? '!text-nordic-gold-500' : '!text-theme-text'
                            }`}
                    >
                        Residences
                    </Button>

                    <Button
                        variant="subtle"
                        component={Link}
                        to="/experiences"
                        className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent ${isActive('/experiences') ? '!text-nordic-gold-500' : '!text-theme-text'
                            }`}
                    >
                        Coastal Experience
                    </Button>

                    {/* Stay / Guest Portal Menu */}
                    <Menu shadow="md" width={220} trigger="hover" openDelay={100} closeDelay={400} radius="md">
                        <Menu.Target>
                            <Button
                                variant="subtle"
                                rightSection={<ChevronDown size={14} />}
                                className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent ${isActive('/apartments') || isActive('/dining') || isActive('/wellness')
                                    ? '!text-nordic-gold-500'
                                    : '!text-theme-text'
                                    }`}
                            >
                                Your Stay
                            </Button>
                        </Menu.Target>

                        <Menu.Dropdown className="bg-theme-bg border-theme-border">
                            <Menu.Label>Arrival & Access</Menu.Label>
                            <Menu.Item
                                component={Link}
                                to="/apartments"
                                leftSection={<LogIn size={16} />}
                                color="nordic-gold"
                                className="font-bold text-nordic-gold-500 hover:bg-theme-surface"
                            >
                                Self Check-in
                            </Menu.Item>
                            <Menu.Item
                                onClick={() => setShowKey(true)}
                                leftSection={<Indicator color="green" size={8} processing><Key size={16} /></Indicator>}
                                className="text-theme-text hover:bg-theme-surface"
                            >
                                Digital Key
                            </Menu.Item>

                            <Menu.Divider />
                            <Menu.Label>Experience & Services</Menu.Label>
                            <Menu.Item
                                component={Link}
                                to="/dining"
                                leftSection={<Utensils size={16} />}
                                className="text-theme-text hover:bg-theme-surface"
                            >
                                Culinary Suites
                            </Menu.Item>
                            <Menu.Item
                                component={Link}
                                to="/wellness"
                                leftSection={<Sparkles size={16} />}
                                className="text-theme-text hover:bg-theme-surface"
                            >
                                Wellness Spa
                            </Menu.Item>
                            <Menu.Item
                                component={Link}
                                to="/concierge"
                                leftSection={<Compass size={16} />}
                                className="text-theme-text hover:bg-theme-surface"
                            >
                                Private Concierge
                            </Menu.Item>
                            <Menu.Item
                                component={Link}
                                to="/my-booking"
                                leftSection={<Calendar size={16} />}
                                className="text-theme-text hover:bg-theme-surface"
                            >
                                My Booking
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>

                    <Button
                        variant="subtle"
                        component={Link}
                        to="/contact"
                        className={`uppercase text-[11px] tracking-widest font-extrabold px-4 hover:bg-transparent ${isActive('/contact') ? '!text-nordic-gold-500' : '!text-theme-text'
                            }`}
                    >
                        Contact
                    </Button>

                    <Box className="ml-6 flex items-center gap-4">
                        <ThemeToggle />
                        <Button
                            className="bg-nordic-gold-500 text-nordic-dark-900 font-bold px-8 rounded-full hover:scale-105 transition-transform uppercase text-xs tracking-widest"
                            size="md"
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
                        color="theme-text"
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
                                <div className="space-y-8">
                                    <Stack gap="md">
                                        <Link to="/" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-theme-text flex items-center gap-4"><Home /> Home</Link>
                                        <Link to="/suites" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-theme-text flex items-center gap-4"><Home /> Residences</Link>
                                        <Link to="/experiences" onClick={() => setIsOpen(false)} className="text-3xl font-serif text-theme-text flex items-center gap-4"><Compass /> Coastal Experience</Link>
                                    </Stack>

                                    <div className="space-y-4">
                                        <Text size="xs" fw={900} tt="uppercase" c="nordic-gold-500" tracking={2}>Your Stay</Text>
                                        <Stack gap="md">
                                            <Link to="/apartments" onClick={() => setIsOpen(false)} className="text-2xl font-serif text-nordic-gold-500 flex items-center gap-4 font-bold"><LogIn /> Self Check-in</Link>
                                            <Link to="/dining" onClick={() => setIsOpen(false)} className="text-2xl font-serif text-theme-text flex items-center gap-4"><Utensils /> Culinary Suites</Link>
                                            <Link to="/wellness" onClick={() => setIsOpen(false)} className="text-2xl font-serif text-theme-text flex items-center gap-4"><Sparkles /> Wellness Spa</Link>
                                            <button onClick={() => { setShowKey(true); setIsOpen(false); }} className="text-2xl font-serif text-theme-text flex items-center gap-4"><Key /> Digital Key</button>
                                            <Link to="/contact" onClick={() => setIsOpen(false)} className="text-2xl font-serif text-theme-text flex items-center gap-4"><MessageSquare /> Contact</Link>
                                        </Stack>
                                    </div>
                                </div>
                            </div>

                            <Button
                                fullWidth
                                size="xl"
                                className="bg-nordic-gold-500 text-nordic-dark-900 font-bold rounded-full mt-auto"
                            >
                                Book Your Stay
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <DigitalKeyDisplay opened={showKey} onClose={() => setShowKey(false)} />
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
