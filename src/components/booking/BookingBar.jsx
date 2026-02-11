import React from 'react';
import { Group, Box, Button, Text, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconSearch, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const BookingBar = ({ onSearch }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[1000px]"
        >
            <GlassCard className="p-0 overflow-visible border-white/10">
                <Group grow gap={0} className="items-stretch">
                    <Box className="p-6 border-r border-white/10 hover:bg-white/5 transition-colors cursor-pointer group">
                        <Text size="xs" tt="uppercase" fw={700} lts={1} className="text-nordic-gold mb-1">Check In</Text>
                        <Text className="text-lg font-medium text-white group-hover:text-nordic-frost">Select Date</Text>
                    </Box>

                    <Box className="p-6 border-r border-white/10 hover:bg-white/5 transition-colors cursor-pointer group">
                        <Text size="xs" tt="uppercase" fw={700} lts={1} className="text-nordic-gold mb-1">Check Out</Text>
                        <Text className="text-lg font-medium text-white group-hover:text-nordic-frost">Select Date</Text>
                    </Box>

                    <Box className="p-6 border-r border-white/10 hover:bg-white/5 transition-colors cursor-pointer group">
                        <Text size="xs" tt="uppercase" fw={700} lts={1} className="text-nordic-gold mb-1">Guests</Text>
                        <Group gap="xs">
                            <IconUsers size={16} className="text-nordic-frost/60" />
                            <Text className="text-lg font-medium text-white group-hover:text-nordic-frost">2 Adults</Text>
                        </Group>
                    </Box>

                    <Button
                        variant="filled"
                        color="gold"
                        h="auto"
                        radius={0}
                        className="text-lg font-bold tracking-widest hover:bg-nordic-gold/90 transition-all group"
                        onClick={onSearch}
                    >
                        <Stack align="center" gap={4}>
                            <IconSearch size={24} />
                            <Text size="xs" tt="uppercase">Search</Text>
                        </Stack>
                    </Button>
                </Group>
            </GlassCard>
        </motion.div>
    );
};

export default BookingBar;
