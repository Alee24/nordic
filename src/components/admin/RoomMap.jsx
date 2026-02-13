import React, { useState } from 'react';
import { Box, SimpleGrid, Text, Group, Badge, Stack, ActionIcon, Transition } from '@mantine/core';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { IconCheck, IconTrash, IconRotateClockwise, IconBed, IconChevronRight, IconSwipe } from '@tabler/icons-react';
import { cn } from '../../utils/cn';

const RoomCard = ({ roomNumber, status, onStatusChange }) => {
    const x = useMotionValue(0);
    const background = useTransform(x, [-100, 0, 100], ['#ff4d4d', 'rgba(26, 27, 30, 0.7)', '#D4AF37']);
    const opacity = useTransform(x, [-100, -50, 0, 50, 100], [1, 0.5, 0, 0.5, 1]);

    const handleDragEnd = (_, info) => {
        if (info.offset.x > 50) {
            onStatusChange(roomNumber, 'Ready');
        } else if (info.offset.x < -50) {
            onStatusChange(roomNumber, 'Cleanup');
        }
    };

    const statusColors = {
        'Ready': 'green',
        'Dirty': 'orange',
        'Occupied': 'blue',
        'Cleanup': 'red'
    };

    return (
        <Box className="relative overflow-hidden rounded-xl h-32 touch-none">
            {/* Background Actions */}
            <Box className="absolute inset-0 flex justify-between items-center px-6">
                <IconTrash color="white" />
                <IconCheck color="#D4AF37" />
            </Box>

            {/* Swipeable Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                style={{ x, position: 'relative', zIndex: 10 }}
                onDragEnd={handleDragEnd}
                className="w-full h-full"
            >
                <motion.div
                    style={{ background }}
                    className="w-full h-full p-4 border border-white/10 flex flex-col justify-between"
                >
                    <Group justify="space-between" align="flex-start">
                        <Stack gap={0}>
                            <Text size="xs" tt="uppercase" lts={1} opacity={0.6}>Suite</Text>
                            <Text fw={700} size="xl">{roomNumber}</Text>
                        </Stack>
                        <Badge
                            color={statusColors[status]}
                            variant="light"
                            size="sm"
                            className="transition-luxury"
                        >
                            {status}
                        </Badge>
                    </Group>

                    <Group justify="space-between" align="center">
                        <IconBed size={16} className="text-norden-frost/40" />
                        <Group gap={4} opacity={0.3}>
                            <Text size="10px">SWIPE</Text>
                            <IconChevronRight size={10} />
                        </Group>
                    </Group>
                </motion.div>
            </motion.div>
        </Box>
    );
};

const RoomMap = () => {
    const [roomData, setRoomData] = useState([
        { id: '401', status: 'Ready' },
        { id: '402', status: 'Dirty' },
        { id: '403', status: 'Occupied' },
        { id: '404', status: 'Cleanup' },
        { id: '501', status: 'Occupied' },
        { id: '502', status: 'Ready' },
        { id: '503', status: 'Dirty' },
        { id: '504', status: 'Occupied' },
    ]);

    const handleStatusChange = (id, newStatus) => {
        setRoomData(prev => prev.map(room => room.id === id ? { ...room, status: newStatus } : room));
    };

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Box>
                    <Text size="xs" tt="uppercase" lts={2} fw={700} className="text-norden-gold mb-1">Interactive Map</Text>
                    <Title order={3} className="font-serif italic">Operational Grid</Title>
                </Box>
                <Group gap="xs">
                    <IconSwipe size={16} className="text-norden-gold/60" />
                    <Text size="xs" opacity={0.5}>Swipe Right for Ready | Left for Cleanup</Text>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="lg">
                {roomData.map(room => (
                    <RoomCard
                        key={room.id}
                        roomNumber={room.id}
                        status={room.status}
                        onStatusChange={handleStatusChange}
                    />
                ))}
            </SimpleGrid>
        </Stack>
    );
};

export default RoomMap;
