import React from 'react';
import { motion } from 'framer-motion';
import {
    Container, Title, Text, Group, Stack, SimpleGrid,
    ThemeIcon, Paper, Button, Box, Divider
} from '@mantine/core';
import {
    Shirt, Waves, Timer, PackageCheck,
    ArrowRight, Sparkles, Wind, CloudFog
} from 'lucide-react';
import Section from '../components/ui/Section';

const LaundryPage = () => {
    const services = [
        {
            icon: <Waves size={32} />,
            title: "Self-Service Access",
            desc: "Every floor features state-of-the-art washing and drying units available 24/7 for our independent residents.",
            color: "blue"
        },
        {
            icon: <Shirt size={32} />,
            title: "Valet Wet Cleaning",
            desc: "Eco-friendly professional cleaning for your everyday attire, collected and returned within 24 hours.",
            color: "norden-gold"
        },
        {
            icon: <Sparkles size={32} />,
            title: "Premium Steam Press",
            desc: "Expert finishing and pressing for executive shirts and suits, ensuring you're always boardroom-ready.",
            color: "cyan"
        },
        {
            icon: <Timer size={32} />,
            title: "Express Service",
            desc: "Urgent laundry needs? Our express 6-hour service ensures your garments are back when you need them.",
            color: "orange"
        }
    ];

    return (
        <div className="bg-theme-bg min-h-screen pt-24 pb-16">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2671&auto=format&fit=crop"
                        alt="Norden Suits Laundry Services"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-norden-dark-900/60 backdrop-blur-[2px]" />
                </div>

                <Container size="xl" className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Group justify="center" gap="sm" mb="md">
                            <span className="h-[1px] w-12 bg-norden-gold-500" />
                            <Text c="gold.4" tt="uppercase" fw={800} lts={3} size="sm">Care & Convenience</Text>
                            <span className="h-[1px] w-12 bg-norden-gold-500" />
                        </Group>
                        <Title order={1} className="text-5xl md:text-7xl font-serif text-white mb-6">
                            Flawless <span className="italic text-norden-gold-500">Service</span>
                        </Title>
                    </motion.div>
                </Container>
            </div>

            <Section>
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <Title order={2} className="text-4xl md:text-5xl font-serif text-theme-text mb-6">
                        Essential Living <br /><span className="italic text-norden-gold-500">Simplified</span>
                    </Title>
                    <Text size="lg" c="dimmed" className="leading-relaxed">
                        At Norden Suits, we understand that independent living means having
                        everything you need at your fingertips. Our professional laundry services
                        allow you to focus on your business while we handle the fine details.
                    </Text>
                </div>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Paper p="xl" radius="xl" withBorder className="bg-theme-surface/30 h-full border-theme-border/50 hover:border-norden-gold-500/50 transition-all group">
                                <ThemeIcon size={64} radius="lg" variant="light" color={service.color === 'norden-gold' ? 'gold' : service.color} className="mb-6 group-hover:scale-110 transition-transform">
                                    {service.icon}
                                </ThemeIcon>
                                <Title order={3} className="font-serif mb-4 text-theme-text">{service.title}</Title>
                                <Text c="dimmed" className="leading-relaxed">
                                    {service.desc}
                                </Text>
                            </Paper>
                        </motion.div>
                    ))}
                </SimpleGrid>
            </Section>

            <Section className="bg-theme-surface/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <Box>
                        <Title order={2} className="text-4xl font-serif text-theme-text mb-8">
                            Home Away From Home <br /><span className="italic text-norden-gold-500">Infrastructure</span>
                        </Title>
                        <Stack gap="xl">
                            <Group align="flex-start" wrap="nowrap">
                                <ThemeIcon size={40} radius="xl" variant="filled" color="gold">
                                    <PackageCheck size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text fw={700} size="lg">Door-to-Door Valet</Text>
                                    <Text c="dimmed">Simply place your items in the provided residence bag and notify the concierge via our app.</Text>
                                </div>
                            </Group>

                            <Group align="flex-start" wrap="nowrap">
                                <ThemeIcon size={40} radius="xl" variant="filled" color="gold">
                                    <CloudFog size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text fw={700} size="lg">Eco-Friendly Solvents</Text>
                                    <Text c="dimmed">We use the finest biodegradable cleaning agents to protect your garments and the coastline.</Text>
                                </div>
                            </Group>

                            <Group align="flex-start" wrap="nowrap">
                                <ThemeIcon size={40} radius="xl" variant="filled" color="gold">
                                    <Wind size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text fw={700} size="lg">Advanced Fabric Care</Text>
                                    <Text c="dimmed">Temperature-controlled air drying and ultrasonic stain removal for delicate materials.</Text>
                                </div>
                            </Group>
                        </Stack>
                    </Box>

                    <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=2670&auto=format&fit=crop"
                            alt="Laundry Facility"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-norden-dark-900/60 to-transparent flex items-end p-12">
                            <Text c="white" size="xl" fw={700} className="font-serif">Residents-Only Private Facilities</Text>
                        </div>
                    </div>
                </div>
            </Section>

            <Container size="xl" py={80} className="text-center">
                <Paper radius="3xl" p={60} className="bg-norden-gold-500 text-norden-dark-900 overflow-hidden relative">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <Title order={2} className="text-4xl md:text-5xl font-serif mb-6">Experience Unlimited <br />Independence</Title>
                        <Text fw={500} size="lg" mb="xl">
                            Your residence is more than just a stay—it's a home base for your coastal life.
                        </Text>
                        <Button
                            size="xl"
                            radius="xl"
                            className="bg-norden-dark-900 text-white hover:bg-black px-12"
                            rightSection={<ArrowRight size={20} />}
                            onClick={() => window.location.href = '/contact'}
                        >
                            Inquire for Long-Stay Rates
                        </Button>
                    </div>
                    {/* Decorative Background Icon */}
                    <div className="absolute -right-20 -bottom-20 opacity-10">
                        <Shirt size={400} />
                    </div>
                </Paper>
            </Container>
        </div>
    );
};

export default LaundryPage;
