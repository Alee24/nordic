import React from 'react';
import { Box, Stack, Title, Text, Container } from '@mantine/core';
import { motion } from 'framer-motion';
import Editable from '../common/Editable';
import BookingBar from '../booking/BookingBar';
import BookingFunnel from '../booking/BookingFunnel';
import { useDisclosure } from '@mantine/hooks';

import PhilosophySection from '../landing/PhilosophySection';
import FeaturedSuites from '../landing/FeaturedSuites';

const HeroDiscovery = () => {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <Box>
            {/* HERO SECTION */}
            <Box className="relative h-screen w-full overflow-hidden">
                <Editable id="hero-bg" type="image" className="absolute inset-0 w-full h-full">
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="w-full h-full"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=2071&auto=format&fit=crop"
                            alt="Luxury Apartment"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </Editable>

                {/* Overlay Gradient */}
                <Box className="absolute inset-0 bg-gradient-to-b from-nordic-dark/40 via-transparent to-nordic-dark" />

                {/* Hero Content */}
                <Container size="xl" className="relative h-full z-10">
                    <Stack justify="center" align="center" className="h-full pt-20" gap="xl">
                        <Stack align="center" gap={0}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <Text
                                    className="text-nordic-gold font-bold tracking-[0.6em] text-xs md:text-sm mb-4"
                                    style={{ textAlign: 'center' }}
                                >
                                    UNCOMPROMISING SOPHISTICATION
                                </Text>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5, delay: 0.2 }}
                            >
                                <Editable id="hero-title" type="text">
                                    <Title
                                        order={1}
                                        className="text-white text-6xl md:text-[7rem] font-serif italic text-center leading-[0.9] tracking-tighter"
                                    >
                                        Refined Living <br className="hidden md:block" /> Under the Arctic
                                    </Title>
                                </Editable>
                            </motion.div>
                        </Stack>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="w-full flex justify-center mt-24"
                        >
                            <BookingBar onSearch={open} />
                        </motion.div>
                    </Stack>
                </Container>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
                >
                    <Text size="10px" tt="uppercase" lts={3}>Discover</Text>
                    <Box className="w-[1px] h-12 bg-white/20" />
                </motion.div>
            </Box>

            {/* PHILOSOPHY SECTION */}
            <PhilosophySection />

            {/* FEATURED SUITES */}
            <FeaturedSuites />

            {/* BOOKING MODAL */}
            <BookingFunnel opened={opened} onClose={close} />
        </Box>
    );
};

export default HeroDiscovery;
