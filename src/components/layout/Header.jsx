import React from 'react';
import { Group, Text, Container, Box, Title } from '@mantine/core';
import { NavLink, Link } from 'react-router-dom';
import { useWindowScroll } from '@mantine/hooks';
import { cn } from '../../utils/cn';
import useManagementStore from '../../store/useManagementStore';

const Header = () => {
    const { toggleAdmin, isAdmin } = useManagementStore();
    const [scroll] = useWindowScroll();
    const isScrolled = scroll.y > 50;

    return (
        <Box
            component="header"
            className={cn(
                "fixed top-0 left-0 w-full z-[1000] py-6 transition-all duration-500 ease-in-out",
                isScrolled ? "bg-nordic-dark/70 backdrop-blur-xl border-b border-nordic-frost/10 py-4" : "bg-transparent"
            )}
        >
            <Container size="xl">
                <Group justify="space-between" align="center">
                    <Link to="/" className="no-underline">
                        <Stack gap={0}>
                            <Title order={3} className="text-nordic-gold tracking-[0.4em] font-bold text-lg md:text-xl uppercase">
                                NORDIC
                            </Title>
                            <Text className="text-nordic-frost/40 font-light uppercase text-[9px] tracking-[0.6em] -mt-1">
                                Sweets
                            </Text>
                        </Stack>
                    </Link>

                    <Group gap="xl" className="hidden md:flex">
                        <NavLink to="/suites" className={({ isActive }) => cn("nav-link", isActive && "active")}>Suites</NavLink>
                        <NavLink to="/experiences" className={({ isActive }) => cn("nav-link", isActive && "active")}>Experiences</NavLink>
                        <NavLink to="/concierge" className={({ isActive }) => cn("nav-link", isActive && "active")}>Concierge</NavLink>
                    </Group>

                    <Group gap="md">
                        <button
                            onClick={toggleAdmin}
                            className={cn(
                                "px-5 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all uppercase border",
                                isAdmin
                                    ? "bg-nordic-gold border-nordic-gold text-nordic-dark"
                                    : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/30"
                            )}
                        >
                            {isAdmin ? 'Admin Active' : 'Staff Access'}
                        </button>
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
