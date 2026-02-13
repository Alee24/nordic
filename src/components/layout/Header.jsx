import React from 'react';
import { Group, Text, Container, Box, Title } from '@mantine/core';
import { NavLink, Link } from 'react-router-dom';
import { useWindowScroll } from '@mantine/hooks';
import { cn } from '../../utils/cn';
import useManagementStore from '../../store/useManagementStore';
import ThemeToggle from '../ui/ThemeToggle';

const Header = () => {
    const { toggleAdmin, isAdmin } = useManagementStore();
    const [scroll] = useWindowScroll();
    const isScrolled = scroll.y > 50;

    return (
        <Box
            component="header"
            className={cn(
                "fixed top-0 left-0 w-full z-[1000] py-6 transition-all duration-500 ease-in-out",
                isScrolled ? "bg-norden-dark/70 backdrop-blur-xl border-b border-norden-frost/10 py-4" : "bg-transparent"
            )}
        >
            <Container size="xl">
                <Group justify="space-between" align="center">
                    <Link to="/" className="group flex items-center gap-2 z-50 no-underline">
                        <div className="flex items-baseline gap-2">
                            <span className={cn(
                                "text-lg md:text-xl font-serif font-bold tracking-[0.2em] leading-none transition-colors duration-500",
                                isScrolled ? "text-theme-text" : "text-white"
                            )}>
                                NORDEN
                            </span>
                            <span className="text-lg md:text-xl font-serif font-bold tracking-[0.2em] leading-none text-norden-gold-500">
                                SUITS
                            </span>
                        </div>
                    </Link>

                    <Group gap="xl" className="hidden md:flex">
                        <NavLink to="/suites" className={({ isActive }) => cn("nav-link", isActive && "active")}>Suites</NavLink>
                        <NavLink to="/experiences" className={({ isActive }) => cn("nav-link", isActive && "active")}>Experiences</NavLink>
                        <NavLink to="/concierge" className={({ isActive }) => cn("nav-link", isActive && "active")}>Concierge</NavLink>
                    </Group>

                    <Group gap="md">
                        <Button // Changed from button to Mantine Button component
                            onClick={toggleAdmin}
                            className={cn(
                                "px-5 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all uppercase border",
                                isAdmin
                                    ? "bg-norden-gold-500 border-norden-gold-500 text-norden-dark-900"
                                    : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/30"
                            )}
                        >
                            {isAdmin ? 'Admin Active' : 'Staff Access'}
                        </Button>
                    </Group>
                </Group>
            </Container>
        </Box>
    );
};

// Internal Stack for the logo helper if not imported
const Stack = ({ children, gap = 0, className }) => (
    <div className={cn("flex flex-col", className)} style={{ gap: `${gap}px` }}>
        {children}
    </div>
);

export default Header;
