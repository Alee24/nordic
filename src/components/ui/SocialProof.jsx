import React, { useState, useEffect } from 'react';
import { Paper, Group, Text, Avatar, Box, UnstyledButton, Stack } from '@mantine/core';
import { IconWorld, IconX, IconTrendingUp } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCATIONS = [
    { country: 'Kenya', city: 'Nairobi', flag: '🇰🇪' },
    { country: 'United Kingdom', city: 'London', flag: '🇬🇧' },
    { country: 'United States', city: 'New York', flag: '🇺🇸' },
    { country: 'Germany', city: 'Berlin', flag: '🇩🇪' },
    { country: 'Japan', city: 'Tokyo', flag: '🇯🇵' },
    { country: 'UAE', city: 'Dubai', flag: '🇦🇪' },
    { country: 'South Africa', city: 'Cape Town', flag: '🇿🇦' },
    { country: 'France', city: 'Paris', flag: '🇫🇷' },
    { country: 'China', city: 'Shanghai', flag: '🇨🇳' },
    { country: 'Nigeria', city: 'Lagos', flag: '🇳🇬' }
];

const SocialProof = () => {
    const [visible, setVisible] = useState(false);
    const [currentData, setCurrentData] = useState(null);

    const generateRandomData = () => {
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const count = Math.floor(Math.random() * 14) + 2; // 2 to 15
        const days = Math.floor(Math.random() * 3) + 1; // 1 to 3
        return { ...location, count, days };
    };

    useEffect(() => {
        // Initial delay before first popup
        const initialTimer = setTimeout(() => {
            setCurrentData(generateRandomData());
            setVisible(true);
        }, 10000);

        return () => clearTimeout(initialTimer);
    }, []);

    useEffect(() => {
        let interval;
        if (visible) {
            // Hide after 6 seconds
            interval = setTimeout(() => {
                setVisible(false);
            }, 6000);
        } else {
            // Show new one after 15-25 seconds
            const nextDelay = Math.floor(Math.random() * 10000) + 15000;
            interval = setTimeout(() => {
                setCurrentData(generateRandomData());
                setVisible(true);
            }, nextDelay);
        }
        return () => clearTimeout(interval);
    }, [visible]);

    if (!currentData) return null;

    return (
        <Box
            className="fixed bottom-6 left-6 z-[1000]"
            component={motion.div}
            initial={false}
        >
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ opacity: 0, x: -100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -100, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <Paper
                            shadow="xl"
                            p="md"
                            radius="lg"
                            withBorder
                            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-norden-gold/20 flex gap-4 max-w-xs relative group overflow-hidden"
                        >
                            {/* Animated accent bar */}
                            <Box className="absolute left-0 top-0 bottom-0 w-1 bg-norden-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />

                            <Avatar size="lg" radius="md" className="bg-norden-gold/10">
                                <Text size="xl">{currentData.flag}</Text>
                            </Avatar>

                            <Stack gap={2} style={{ flex: 1 }}>
                                <Group justify="space-between" align="center" wrap="nowrap">
                                    <Group gap={4}>
                                        <IconTrendingUp size={14} className="text-norden-gold animate-pulse" />
                                        <Text size="xs" fw={800} tt="uppercase" className="text-norden-gold tracking-widest">
                                            Live Activity
                                        </Text>
                                    </Group>
                                    <UnstyledButton
                                        onClick={() => setVisible(false)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <IconX size={14} />
                                    </UnstyledButton>
                                </Group>

                                <Text size="sm" className="text-slate-700 dark:text-slate-200 leading-tight">
                                    <Text span fw={700} className="text-norden-gold">{currentData.count} guest(s)</Text> from {currentData.country} have made a booking in the last {currentData.days} days.
                                </Text>

                                <Text size="xs" c="dimmed" fs="italic">
                                    Verified Resident at Norden Suites
                                </Text>
                            </Stack>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default SocialProof;
