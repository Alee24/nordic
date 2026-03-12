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
import api from '../services/api';

const ContactPage = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            guest_name: formData.get('guest_name'),
            guest_email: formData.get('guest_email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        };

        try {
            const { data: result } = await api.post('/messages', data);

            if (result.success) {
                setSubmitted(true);
                notifications.show({
                    title: 'Message Sent!',
                    message: 'Our concierge will get back to you shortly. Welcome home.',
                    color: 'green',
                });
                setTimeout(() => setSubmitted(false), 5000);
                e.target.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            notifications.show({
                title: 'Error Sending Message',
                message: error.response?.data?.message || error.message || 'Something went wrong. Please try again.',
                color: 'red',
            });
        }
    };

    return (
        <div className="bg-theme-bg min-h-screen transition-colors duration-300">
            {/* Premium Hero Section */}
            <div className="relative h-[500px] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/reception1.jpg"
                        alt="Norden Suites Concierge"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-norden-dark-900/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-bg/60 via-transparent to-transparent" />
                </div>
            </div>

            <Section className="relative z-10 pt-16">
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
                                            <Text size="sm" c="dimmed">+254 108 111 118</Text>
                                        </Box>
                                    </Group>

                                    <Group align="flex-start" wrap="nowrap">
                                        <ThemeIcon size={48} radius="md" color="gold.1" c="gold.7" variant="light">
                                            <Mail size={24} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text fw={700} className="text-theme-text">Email Inquiries</Text>
                                            <Text size="sm" c="dimmed">welcome@nordensuites.com</Text>
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
                                    <div className="absolute inset-0 z-20 bg-norden-gold-500 flex flex-col items-center justify-center text-norden-dark-900 animate-in fade-in zoom-in duration-500">
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
                                                    name="guest_name"
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
                                                    name="guest_email"
                                                    label="Email Address"
                                                    placeholder="your@email.com"
                                                    radius="md"
                                                    size="md"
                                                    required
                                                    type="email"
                                                    classNames={{ label: 'text-theme-text', input: 'bg-theme-surface border-theme-border text-theme-text' }}
                                                />
                                            </Grid.Col>
                                        </Grid>

                                        <TextInput
                                            name="subject"
                                            label="Subject"
                                            placeholder="Reservation Inquiry, Event Planning, etc."
                                            radius="md"
                                            size="md"
                                            classNames={{ label: 'text-theme-text', input: 'bg-theme-surface border-theme-border text-theme-text' }}
                                        />

                                        <Textarea
                                            name="message"
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
