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
            <div className="relative h-[65vh] min-h-[500px] w-full overflow-hidden flex items-end">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/door.jpg"
                        alt="Norden Suites Entry"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-theme-bg/20 to-transparent" />
                </div>

                <Container size="xl" className="relative z-10 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Text c="norden-gold.4" tt="uppercase" fw={900} lts={5} size="xs" mb="xs">
                            Personalized Service
                        </Text>
                        <Title className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-[1.1]">
                            The <span className="italic text-norden-gold-500">Concierge</span>
                        </Title>
                    </motion.div>
                </Container>
            </div>

            <Section className="relative z-10 pt-20 pb-32">
                <Grid gutter={80}>
                    {/* Contact Info Column */}
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Stack gap={50}>
                                <Box>
                                    <Title order={2} className="font-serif !text-4xl mb-6 text-theme-text leading-tight">
                                        Elegance in Every <span className="italic text-norden-gold-500">Inquiry</span>
                                    </Title>
                                    <Text c="dimmed" size="lg" className="font-light leading-relaxed">
                                        At Norden Suites, we provide more than just a stay—we curate a coastal experience.
                                        Our dedicated team is ready to assist with your bespoke requirements.
                                    </Text>
                                </Box>

                                <Stack gap="xl">
                                    <div className="group cursor-pointer">
                                        <Group align="flex-start" wrap="nowrap" gap="xl">
                                            <ThemeIcon size={56} radius="xl" color="norden-gold.5" variant="outline" className="border-norden-gold-500/30">
                                                <MapPin size={24} />
                                            </ThemeIcon>
                                            <Box>
                                                <Text fw={800} tt="uppercase" lts={1} size="xs" c="norden-gold.5" mb={4}>Location</Text>
                                                <Text size="lg" fw={600} className="text-theme-text">Nyali</Text>
                                                <Text size="sm" c="dimmed">Mombasa, Kenya</Text>
                                            </Box>
                                        </Group>
                                    </div>

                                    <div className="group cursor-pointer">
                                        <Group align="flex-start" wrap="nowrap" gap="xl">
                                            <ThemeIcon size={56} radius="xl" color="norden-gold.5" variant="outline" className="border-norden-gold-500/30">
                                                <Phone size={24} />
                                            </ThemeIcon>
                                            <Box>
                                                <Text fw={800} tt="uppercase" lts={1} size="xs" c="norden-gold.5" mb={4}>Direct Line</Text>
                                                <Text size="lg" fw={600} className="text-theme-text">+254 108 111 118</Text>
                                                <Text size="sm" c="dimmed">Available 24/7 for you</Text>
                                            </Box>
                                        </Group>
                                    </div>

                                    <div className="group cursor-pointer">
                                        <Group align="flex-start" wrap="nowrap" gap="xl">
                                            <ThemeIcon size={56} radius="xl" color="norden-gold.5" variant="outline" className="border-norden-gold-500/30">
                                                <Mail size={24} />
                                            </ThemeIcon>
                                            <Box>
                                                <Text fw={800} tt="uppercase" lts={1} size="xs" c="norden-gold.5" mb={4}>Digital Box</Text>
                                                <Text size="lg" fw={600} className="text-theme-text">welcome@nordensuites.com</Text>
                                                <Text size="sm" c="dimmed">Replies within 2 hours</Text>
                                            </Box>
                                        </Group>
                                    </div>
                                </Stack>

                                <Box pt="xl">
                                    <Text fw={800} size="xs" tt="uppercase" lts={3} mb="xl" className="text-theme-text text-center md:text-left">Social Connection</Text>
                                    <Group gap="lg" justify={{ base: 'center', md: 'flex-start' }}>
                                        {[
                                            { icon: <Instagram size={22} />, label: 'Instagram' },
                                            { icon: <Facebook size={22} />, label: 'Facebook' },
                                            { icon: <Twitter size={22} />, label: 'Twitter' }
                                        ].map((social, i) => (
                                            <ActionIcon
                                                key={i}
                                                size={54}
                                                radius="xl"
                                                variant="subtle"
                                                color="norden-gold"
                                                className="hover:bg-norden-gold-500/10 transition-all duration-300"
                                            >
                                                {social.icon}
                                            </ActionIcon>
                                        ))}
                                    </Group>
                                </Box>
                            </Stack>
                        </motion.div>
                    </Grid.Col>

                    {/* Contact Form Column */}
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Paper
                                shadow="2xl"
                                radius="28px"
                                p={{ base: 30, md: 50 }}
                                withBorder
                                className="bg-theme-surface/50 backdrop-blur-xl border-white/5 relative overflow-hidden"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-norden-gold-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-norden-gold-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />

                                {submitted && (
                                    <div className="absolute inset-0 z-20 bg-norden-gold-500 flex flex-col items-center justify-center text-norden-dark-900 animate-in fade-in zoom-in duration-500">
                                        <ThemeIcon size={80} radius="xl" color="white" c="gold.6" mb="xl">
                                            <Send size={40} />
                                        </ThemeIcon>
                                        <Title order={2} className="font-serif">Message Received</Title>
                                        <Text fw={600} mt="sm">We will respond shortly.</Text>
                                        <Button
                                            variant="white"
                                            color="dark"
                                            radius="xl"
                                            mt="xl"
                                            onClick={() => setSubmitted(false)}
                                        >
                                            Send Another
                                        </Button>
                                    </div>
                                )}

                                <Title order={3} className="font-serif !text-3xl mb-10 text-theme-text">Direct Inquiry</Title>
                                <form onSubmit={handleSubmit}>
                                    <Stack gap="xl">
                                        <Grid gutter="xl">
                                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                                <TextInput
                                                    name="guest_name"
                                                    label="Your Full Name"
                                                    placeholder="e.g. John Doe"
                                                    radius="md"
                                                    size="lg"
                                                    required
                                                    classNames={{
                                                        label: 'text-xs uppercase font-bold tracking-wider mb-2 text-theme-muted',
                                                        input: 'bg-theme-bg/50 border-white/10 focus:border-norden-gold-500/50 transition-all text-theme-text h-14'
                                                    }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                                <TextInput
                                                    name="guest_email"
                                                    label="Email Address"
                                                    placeholder="your@email.com"
                                                    radius="md"
                                                    size="lg"
                                                    required
                                                    type="email"
                                                    classNames={{
                                                        label: 'text-xs uppercase font-bold tracking-wider mb-2 text-theme-muted',
                                                        input: 'bg-theme-bg/50 border-white/10 focus:border-norden-gold-500/50 transition-all text-theme-text h-14'
                                                    }}
                                                />
                                            </Grid.Col>
                                        </Grid>

                                        <TextInput
                                            name="subject"
                                            label="What is this regarding?"
                                            placeholder="e.g. Booking Inquiry, Spa Reservation"
                                            radius="md"
                                            size="lg"
                                            classNames={{
                                                label: 'text-xs uppercase font-bold tracking-wider mb-2 text-theme-muted',
                                                input: 'bg-theme-bg/50 border-white/10 focus:border-norden-gold-500/50 transition-all text-theme-text h-14'
                                            }}
                                        />

                                        <Textarea
                                            name="message"
                                            label="Message"
                                            placeholder="Tell us how we can make your stay exceptional..."
                                            minRows={5}
                                            radius="md"
                                            size="lg"
                                            required
                                            classNames={{
                                                label: 'text-xs uppercase font-bold tracking-wider mb-2 text-theme-muted',
                                                input: 'bg-theme-bg/50 border-white/10 focus:border-norden-gold-500/50 transition-all text-theme-text p-4'
                                            }}
                                        />

                                        <Button
                                            type="submit"
                                            size="xl"
                                            radius="xl"
                                            fullWidth
                                            className="bg-norden-gold-500 hover:bg-norden-gold-600 text-norden-dark-900 font-bold h-16 shadow-lg shadow-norden-gold-500/20 active:scale-95 transition-all"
                                            rightSection={<ArrowRight size={22} />}
                                        >
                                            Submit Request
                                        </Button>
                                    </Stack>
                                </form>
                            </Paper>
                        </motion.div>
                    </Grid.Col>
                </Grid>
            </Section>

            {/* Map Section */}
            <div className="h-[500px] w-full relative overflow-hidden group">
                <Box className="absolute inset-0 bg-theme-bg/40 z-10 pointer-events-none group-hover:bg-transparent transition-all duration-700" />
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.827361842886!2d39.7098432!3d-4.0330651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1840130006fac081%3A0x2e7584bec116d87!2sNorden%20Suites!5e0!3m2!1sen!2ske!4v1710500000000!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    className="grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
            </div>
        </div>
    );
};

export default ContactPage;
