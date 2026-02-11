import React from 'react';
import { Box, Container, Title, Text, SimpleGrid, Group, Button, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import SuiteCard from '../booking/SuiteCard';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const featuredSuites = [
    {
        id: 'nordic-sky',
        title: 'Nordic Sky Penthouse',
        price: 450,
        description: 'Experience the pinnacle of Arctic living with a 360-degree view of the aurora.',
        images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=2071&auto=format&fit=crop'],
        capacity: 2,
        features: ['wifi', 'coffee', 'concierge']
    },
    {
        id: 'midnight-suite',
        title: 'Midnight Slate Suite',
        price: 320,
        description: 'A moody, textured escape designed for rejuvenation and creative focus.',
        images: ['https://images.unsplash.com/photo-1560448204-61dc36dc98c8?q=80&w=2070&auto=format&fit=crop'],
        capacity: 2,
        features: ['wifi', 'coffee', 'concierge']
    }
];

const FeaturedSuites = () => {
    return (
        <Box className="bg-nordic-dark py-32">
            <Container size="xl">
                <Group justify="space-between" align="flex-end" mb={60}>
                    <Stack gap="xs">
                        <Text className="text-nordic-gold font-bold tracking-[0.4em] text-xs">THE COLLECTION</Text>
                        <Title order={2} className="font-serif italic text-5xl">Curated Sanctuaries</Title>
                    </Stack>
                    <Button
                        component={Link}
                        to="/suites"
                        variant="subtle"
                        color="gold"
                        rightSection={<IconChevronRight size={16} />}
                        className="hover:translate-x-2 transition-transform"
                    >
                        VIEW ALL ABODES
                    </Button>
                </Group>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50}>
                    {featuredSuites.map((suite, idx) => (
                        <motion.div
                            key={suite.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: idx * 0.2 }}
                            viewport={{ once: true }}
                        >
                            <SuiteCard {...suite} onSelect={() => { }} />
                        </motion.div>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default FeaturedSuites;
