import React from 'react';
import { Stack, Text, Group, Box, Badge, Title, ScrollArea } from '@mantine/core';
import { IconPlane, IconCreditCard, IconDroplet, IconClock } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/common/GlassCard';

const PulseItem = ({ icon: Icon, title, status, time, color, description }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="border-l-2 pl-4 py-2 border-white/10 hover:border-norden-gold transition-colors"
    >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="md">
                <Box className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
                    <Icon size={20} />
                </Box>
                <Box>
                    <Text fw={700} size="sm">{title}</Text>
                    <Text size="xs" opacity={0.6}>{description}</Text>
                </Box>
            </Group>
            <Stack align="flex-end" gap={0}>
                <Badge variant="light" color={color} size="sm" radius="sm">{status}</Badge>
                <Group gap={4} mt={4} opacity={0.4}>
                    <IconClock size={10} />
                    <Text size="10px">{time}</Text>
                </Group>
            </Stack>
        </Group>
    </motion.div>
);

const PulseFeed = () => {
    const updates = [
        { title: 'John Doe', description: 'Arriving KQ102 - Chauffeur Assigned', status: 'ARRIVAL', time: '2 mins ago', color: 'blue', icon: IconPlane },
        { title: 'KES 58,500', description: 'M-Pesa Payment ID: TXN_892', status: 'PAID', time: '15 mins ago', color: 'green', icon: IconCreditCard },
        { title: 'Suite 402', description: 'Guest Checked Out', status: 'DIRTY', time: '45 mins ago', color: 'orange', icon: IconDroplet },
        { title: 'Jane Smith', description: 'Pending Identity Verification', status: 'ACTION', time: '1 hr ago', color: 'red', icon: IconClock },
    ];

    return (
        <GlassCard className="h-full flex flex-col p-6">
            <Group justify="space-between" mb="xl">
                <Title order={4} className="font-serif italic text-xl">The Pulse</Title>
                <Badge variant="dot" color="red" className="animate-pulse">LIVE FEED</Badge>
            </Group>

            <ScrollArea h={400} offsetScrollbars>
                <Stack gap="lg">
                    {updates.map((update, idx) => (
                        <PulseItem key={idx} {...update} />
                    ))}
                </Stack>
            </ScrollArea>
        </GlassCard>
    );
};

export default PulseFeed;
