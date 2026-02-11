import React, { useState } from 'react';
import {
    Container,
    Grid,
    Stack,
    Text,
    Title,
    TextInput,
    Textarea,
    Button,
    Group,
    Paper,
    ThemeIcon,
    Box,
    ActionIcon,
    Divider,
    Transition
} from '@mantine/core';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import Section from '../components/ui/Section';

const ContactPage = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        notifications.show({
            title: 'Message Sent',
            message: 'Our concierge will get back to you shortly. Welcome home.',
            color: 'gold',
        });
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="bg-theme-bg min-h-screen transition-colors duration-300">
            {/* Premium Hero Section */}
            <div className="relative h-[500px] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2680&auto=format&fit=crop"
                        alt="Nordic Suites Concierge"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-nordic-dark-900/60 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-transparent to-transparent" />
                </div>

                <Container size="xl" className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Group justify="center" gap="sm" mb="md">
                            <span className="h-[1px] w-12 bg-nordic-gold-500" />
                            <Text c="gold.4" tt="uppercase" fw={800} lts={3} size="sm">Concierge & Inquiries</Text>
                            <span className="h-[1px] w-12 bg-nordic-gold-500" />
                        </Group>
                        <Title order={1} className="text-5xl md:text-7xl font-serif text-white mb-6">
                            Welcome <span className="italic text-nordic-gold-500">Home</span>
                        </Title>
                        <Text c="gray.3" size="xl" className="max-w-2xl mx-auto font-light leading-relaxed">
                            Experience the pinnacle of coastal hospitality. Our dedicated concierge team is available 24/7
                            to ensure your stay at Nordic Suites is nothing short of extraordinary.
                        </Text>
                    </motion.div>
                </Container>
            </div>

            <Section className="relative z-10 -mt-20 pt-0">
                <Grid gutter={40}>
                    {/* Contact Info Column */}
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Stack gap={40}>
                                <Box>
                                    <Title order={2} className="font-serif !text-3xl mb-6 text-theme-text">Get in Touch</Title>
                                    <Text c="dimmed" mb="xl">
                                        Whether you have a question about our residences, concierge services,
                                        or wish to plan a bespoke coastal experience, we are here to assist.
                                    </Text>
                                </Box>

                                <Stack gap="xl">
                                    <Group align="flex-start" wrap="nowrap">
                                        <ThemeIcon size={48} radius="md" color="gold.1" c="gold.7" variant="light">
                                            <MapPin size={24} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text fw={700} className="text-theme-text">The Residence</Text>
                                            <Text size="sm" c="dimmed">Nyali Beach Road, Mombasa, Kenya</Text>
                                        </Box>
                                    </Group>

                                    <Group align="flex-start" wrap="nowrap">
                                        <ThemeIcon size={48} radius="md" color="gold.1" c="gold.7" variant="light">
                                            <Phone size={24} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text fw={700} className="text-theme-text">24/7 Concierge</Text>
                                            <Text size="sm" c="dimmed">+254 700 000 000</Text>
                                        </Box>
                                    </Group>

                                    <Group align="flex-start" wrap="nowrap">
                                        <ThemeIcon size={48} radius="md" color="gold.1" c="gold.7" variant="light">
                                            <Mail size={24} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text fw={700} className="text-theme-text">Email Inquiries</Text>
                                            <Text size="sm" c="dimmed">concierge@nordicsuites.com</Text>
                                        </Box>
                                    </Group>
                                </Stack>

                                <Divider variant="dashed" />

                                <Box>
                                    <Text fw={700} size="sm" tt="uppercase" lts={2} mb="md" className="text-theme-text">Follow Our Journey</Text>
                                    <Group gap="md">
                                        <ActionIcon size="xl" radius="xl" variant="light" color="gold">
                                            <Instagram size={20} />
                                        </ActionIcon>
                                        <ActionIcon size="xl" radius="xl" variant="light" color="gold">
                                            <Facebook size={20} />
                                        </ActionIcon>
                                        <ActionIcon size="xl" radius="xl" variant="light" color="gold">
                                            <Twitter size={20} />
                                        </ActionIcon>
                                    </Group>
                                </Box>
                            </Stack>
                        </motion.div>
                    </Grid.Col>

                    {/* Contact Form Column */}
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Paper shadow="xl" radius="xl" p={40} withBorder className="bg-theme-bg overflow-hidden relative">
                                {submitted && (
                                    <div className="absolute inset-0 z-20 bg-nordic-gold-500 flex flex-col items-center justify-center text-nordic-dark-900 animate-in fade-in zoom-in duration-500">
                                        <ThemeIcon size={80} radius="xl" color="white" c="gold.6" mb="xl">
                                            <Send size={40} />
                                        </ThemeIcon>
                                        <Title order={2} className="font-serif">Message Received</Title>
                                        <Text fw={500} mt="sm">Welcome to the family.</Text>
                                    </div>
                                )}

                                <Title order={3} className="font-serif !text-2xl mb-8 text-theme-text">Direct Inquiry</Title>
                                <form onSubmit={handleSubmit}>
                                    <Stack gap="lg">
                                        <Grid>
                                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                                <TextInput
                                                    label="Guest Name"
                                                    placeholder="Enter your name"
                                                    radius="md"
                                                    size="md"
                                                    required
                                                    classNames={{ label: 'text-theme-text', input: 'bg-theme-surface border-theme-border text-theme-text' }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                                <TextInput
                                                    label="Email Address"
                                                    placeholder="your@email.com"
                                                    radius="md"
                                                    size="md"
                                                    required
                                                    classNames={{ label: 'text-theme-text', input: 'bg-theme-surface border-theme-border text-theme-text' }}
                                                />
                                            </Grid.Col>
                                        </Grid>

                                        <TextInput
                                            label="Subject"
                                            placeholder="Reservation Inquiry, Event Planning, etc."
                                            radius="md"
                                            size="md"
                                            classNames={{ label: 'text-theme-text', input: 'bg-theme-surface border-theme-border text-theme-text' }}
                                        />

                                        <Textarea
                                            label="How can our concierge assist you?"
                                            placeholder="Tell us about your requirements..."
                                            minRows={4}
                                            radius="md"
                                            size="md"
                                            required
                                            classNames={{ label: 'text-theme-text', input: 'bg-theme-surface border-theme-border text-theme-text' }}
                                        />

                                        <Button
                                            type="submit"
                                            size="lg"
                                            radius="xl"
                                            className="bg-nordic-gold-500 text-nordic-dark-900 font-bold mt-4"
                                            rightSection={<ArrowRight size={18} />}
                                        >
                                            Send Concierge Inquiry
                                        </Button>
                                    </Stack>
                                </form>
                            </Paper>
                        </motion.div>
                    </Grid.Col>
                </Grid>
            </Section>

            {/* Map Section */}
            <div className="h-[400px] w-full grayscale hover:grayscale-0 transition-all duration-1000">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15919.231238479532!2d39.71261!3d-4.043513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1840129a00ce5577%3A0xe5493b827e8d641c!2sNyali%20Beach!5e0!3m2!1sen!2ske!4v1710500000000!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    aria-hidden="false"
                    tabIndex="0"
                />
            </div>
        </div>
    );
};

export default ContactPage;
