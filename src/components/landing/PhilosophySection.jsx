import React from 'react';
import { Box, Container, Grid, Stack, Title, Text, Image } from '@mantine/core';
import { motion } from 'framer-motion';

const PhilosophySection = () => {
    return (
        <Box className="bg-norden-dark py-32 overflow-hidden">
            <Container size="xl">
                <Grid gutter={80} align="center">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                        >
                            <Stack gap="xl">
                                <Box>
                                    <Text className="text-norden-gold font-bold tracking-[0.4em] text-xs mb-4">OUR PHILOSOPHY</Text>
                                    <Title order={2} className="font-serif italic text-5xl md:text-7xl leading-tight">
                                        The Art of <br /> Quiet Luxury
                                    </Title>
                                </Box>
                                <Text className="text-norden-frost/70 text-lg leading-relaxed max-w-lg">
                                    At Norden Suits, we believe that true luxury isn't shouted; it's felt.
                                    Inspired by the raw elegance of the Arctic landscape, our spaces are
                                    designed to provide a sanctuary for the soul—where minimalism
                                    meets uncompromising warmth.
                                </Text>
                                <Box className="pt-4">
                                    <Text className="font-serif italic text-2xl border-l-2 border-norden-gold pl-6 py-2">
                                        "A sanctuary where time slows down, and the senses awaken."
                                    </Text>
                                </Box>
                            </Stack>
                        </motion.div>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Box className="relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className="z-10 relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl"
                            >
                                <Image
                                    src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974&auto=format&fit=crop"
                                    alt="Luxury Interior Details"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Decorative Frame */}
                            <motion.div
                                initial={{ opacity: 0, x: 20, y: 20 }}
                                whileInView={{ opacity: 0.2, x: 40, y: 40 }}
                                transition={{ duration: 2 }}
                                viewport={{ once: true }}
                                className="absolute inset-0 border-2 border-norden-gold rounded-2xl -z-0"
                            />
                        </Box>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

export default PhilosophySection;
