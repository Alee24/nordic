import React, { useState } from 'react';
import { Box, Group, Button, Divider, Text, Stack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconUser, IconChevronRight, IconArrowRight } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@mantine/hooks';

const BookingBarLuxury = ({ onCheck }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [dates, setDates] = useState([null, null]);

    return (
        <AnimatePresence>
            {isMobile ? (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="fixed bottom-8 right-8 z-[100]"
                >
                    <Button
                        size="xl"
                        radius="xl"
                        color="gold"
                        className="shadow-[0_10px_30px_rgba(212,175,55,0.4)] h-16 w-16 p-0"
                        onClick={onCheck}
                    >
                        <IconCalendar size={28} />
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[1000px] z-20 px-6"
                >
                    <Box className="bg-nordic-dark/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 pl-10 shadow-2xl flex items-center justify-between hover:border-nordic-gold/30 transition-luxury group">
                        <Group gap={40} className="flex-1">
                            <Box className="flex-1">
                                <DatePickerInput
                                    type="range"
                                    placeholder="Arrival — Departure"
                                    variant="unstyled"
                                    leftSection={<IconCalendar size={18} className="text-nordic-gold" />}
                                    value={dates}
                                    onChange={setDates}
                                    styles={{
                                        input: { color: '#E1E8ED', fontWeight: 600, fontSize: '15px', letterSpacing: '0.02em', height: '40px' },
                                        placeholder: { color: 'rgba(225,232,235,0.4)', fontWeight: 500 }
                                    }}
                                />
                            </Box>

                            <Divider orientation="vertical" h={20} color="rgba(255,255,255,0.1)" />

                            <Group gap="xs" className="cursor-pointer pr-10">
                                <IconUser size={18} className="text-nordic-gold" />
                                <Stack gap={0}>
                                    <Text size="15px" fw={600} className="text-nordic-frost">2 Guests</Text>
                                    <Text size="10px" tt="uppercase" lts={1} opacity={0.4}>Occupancy</Text>
                                </Stack>
                            </Group>
                        </Group>

                        <Button
                            size="xl"
                            radius="xl"
                            color="gold"
                            className="h-14 px-10 font-bold tracking-[0.1em] shadow-xl group-hover:scale-[1.02] transition-luxury"
                            rightSection={<IconArrowRight size={18} />}
                            onClick={onCheck}
                        >
                            CHECK AVAILABILITY
                        </Button>
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BookingBarLuxury;
