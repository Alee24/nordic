import React from 'react';
import { Box, Image, Text, Title, Badge, Group, Stack, Button } from '@mantine/core';
import { IconWifi, IconCoffee, IconHanger, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import { cn } from '../../utils/cn';

const SuiteCard = ({ title, price, description, images, capacity, features, onSelect, isSelected }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <GlassCard
                className={cn(
                    "h-full flex flex-col p-0 border border-white/5 transition-all",
                    isSelected ? "border-nordic-gold ring-1 ring-nordic-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]" : "hover:border-white/20"
                )}
            >
                <Box className="relative h-64 overflow-hidden">
                    <Image
                        src={images[0]}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                    <Box className="absolute top-4 right-4">
                        <Badge color="gold" size="lg" radius="sm" className="shadow-lg">
                            ${price} / Night
                        </Badge>
                    </Box>
                </Box>

                <Stack p="xl" className="flex-1" gap="md">
                    <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                            <Title order={3} className="font-serif italic text-2xl">{title}</Title>
                            <Group gap="xs">
                                <IconUsers size={14} className="text-nordic-frost/60" />
                                <Text size="xs" tt="uppercase" lts={1} className="text-nordic-frost/60">Up to {capacity} Guests</Text>
                            </Group>
                        </Stack>
                    </Group>

                    <Text size="sm" className="opacity-70 line-clamp-2">
                        {description}
                    </Text>

                    <Group gap="md">
                        {features.includes('wifi') && <IconWifi size={18} className="text-nordic-gold" />}
                        {features.includes('coffee') && <IconCoffee size={18} className="text-nordic-gold" />}
                        {features.includes('concierge') && <IconHanger size={18} className="text-nordic-gold" />}
                    </Group>

                    <Box mt="auto" pt="lg">
                        <Button
                            fullWidth
                            variant={isSelected ? "filled" : "outline"}
                            color="gold"
                            onClick={onSelect}
                            className="font-bold tracking-widest"
                        >
                            {isSelected ? 'SELECTED' : 'SELECT SUITE'}
                        </Button>
                    </Box>
                </Stack>
            </GlassCard>
        </motion.div>
    );
};

export default SuiteCard;
