import React, { useState, useRef } from 'react';
import {
    Container,
    Stepper,
    Box,
    Title,
    Text,
    Stack,
    TextInput,
    Button,
    Group,
    Grid,
    Card,
    Image,
    Badge,
    ActionIcon
} from '@mantine/core';
import {
    IconPlane,
    IconId,
    IconSignature,
    IconCar,
    IconChevronRight,
    IconChevronLeft,
    IconCheck,
    IconTrash
} from '@tabler/icons-react';
import SignaturePad from 'react-signature-canvas';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import { notifications } from '@mantine/notifications';

const vehicles = [
    { id: 'suv', name: 'Premium SUV', type: 'Range Rover Sport', image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?q=80&w=1974&auto=format&fit=crop', seats: 4 },
    { id: 'sedan', name: 'Luxury Sedan', type: 'Mercedes S-Class', image: 'https://images.unsplash.com/photo-1563720223185-11003d516905?q=80&w=2070&auto=format&fit=crop', seats: 3 },
];

const GuestConcierge = () => {
    const [active, setActive] = useState(0);
    const [flightNumber, setFlightNumber] = useState('');
    const [isValidFlight, setIsValidFlight] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [idFile, setIdFile] = useState(null);
    const sigPad = useRef(null);

    const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const validateFlight = () => {
        // Mock flight validation
        if (flightNumber.length >= 4) {
            setIsValidFlight(true);
            notifications.show({
                title: 'Flight Verified',
                message: 'Your arrival has been shared with our chauffeur team.',
                color: 'green',
            });
        } else {
            notifications.show({
                title: 'Invalid Flight Number',
                message: 'Please provide a valid international flight number.',
                color: 'red',
            });
        }
    };

    const clearSignature = () => sigPad.current.clear();

    return (
        <Container size="md" py={120}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Stack mb={50}>
                    <Title order={1} className="font-serif italic text-5xl">Digital Concierge</Title>
                    <Text className="text-nordic-frost/60">Experience the freedom of paperless luxury from the moment you land.</Text>
                </Stack>

                <Stepper active={active} onStepClick={setActive} color="gold" iconSize={38}>
                    {/* STEP 1: AIRPORT PICKUP */}
                    <Stepper.Step
                        label="Airport Pickup"
                        description="Smart flight tracking"
                        icon={<IconPlane size={22} />}
                    >
                        <Stack mt="xl" gap="xl">
                            <GlassCard className="p-8">
                                <Title order={3} className="mb-4">Welcome to Nairobi</Title>
                                <Text size="sm" className="mb-6 opacity-80">Enter your flight number to enable real-time tracking for your representative.</Text>

                                <Group align="flex-end">
                                    <TextInput
                                        label="Flight Number"
                                        placeholder="e.g. KQ101 / EK722"
                                        value={flightNumber}
                                        onChange={(e) => setFlightNumber(e.currentTarget.value.toUpperCase())}
                                        className="flex-1"
                                        size="lg"
                                        variant="filled"
                                        styles={{ input: { backgroundColor: 'rgba(255,255,255,0.05)' } }}
                                    />
                                    <Button size="lg" color="gold" onClick={validateFlight}>VERIFY</Button>
                                </Group>
                            </GlassCard>

                            <AnimatePresence>
                                {isValidFlight && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Title order={4} className="mb-6 flex items-center gap-2">
                                            <IconCar className="text-nordic-gold" /> Select Your Vehicle
                                        </Title>
                                        <Grid>
                                            {vehicles.map((v) => (
                                                <Grid.Col span={{ base: 12, md: 6 }} key={v.id}>
                                                    <Card
                                                        className={`cursor-pointer transition-all border ${selectedVehicle?.id === v.id ? 'border-nordic-gold bg-nordic-gold/10' : 'border-white/5 bg-white/5'}`}
                                                        onClick={() => setSelectedVehicle(v)}
                                                        radius="md"
                                                        p="md"
                                                    >
                                                        <Box className="h-40 overflow-hidden rounded-md mb-4">
                                                            <Image src={v.image} className="w-full h-full object-cover" />
                                                        </Box>
                                                        <Group justify="space-between">
                                                            <Box>
                                                                <Text fw={700}>{v.name}</Text>
                                                                <Text size="xs" opacity={0.6}>{v.type}</Text>
                                                            </Box>
                                                            <Badge color="gold" variant="light">{v.seats} Seats</Badge>
                                                        </Group>
                                                    </Card>
                                                </Grid.Col>
                                            ))}
                                        </Grid>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Stack>
                    </Stepper.Step>

                    {/* STEP 2: DIGITAL REGISTRATION */}
                    <Stepper.Step
                        label="Registration"
                        description="Identity verification"
                        icon={<IconId size={22} />}
                    >
                        <Stack mt="xl" gap="xl">
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <GlassCard className="h-full">
                                        <Title order={3} className="mb-6">Passport / ID Upload</Title>
                                        <Box
                                            className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center hover:border-nordic-gold transition-colors cursor-pointer"
                                            onClick={() => document.getElementById('id-upload').click()}
                                        >
                                            {idFile ? (
                                                <Stack align="center">
                                                    <IconCheck size={40} className="text-nordic-gold" />
                                                    <Text>{idFile.name}</Text>
                                                </Stack>
                                            ) : (
                                                <Stack align="center">
                                                    <IconId size={40} opacity={0.4} />
                                                    <Text size="sm">Click to upload document photo</Text>
                                                </Stack>
                                            )}
                                            <input
                                                type="file"
                                                id="id-upload"
                                                className="hidden"
                                                onChange={(e) => setIdFile(e.target.files[0])}
                                            />
                                        </Box>
                                    </GlassCard>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <GlassCard className="h-full">
                                        <Group justify="space-between" className="mb-6">
                                            <Title order={3}>Signature</Title>
                                            <ActionIcon variant="subtle" color="red" onClick={clearSignature}>
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                        </Group>
                                        <Box className="bg-white rounded-lg p-2 h-48">
                                            <SignaturePad
                                                ref={sigPad}
                                                canvasProps={{ className: 'w-full h-full' }}
                                                penColor="#1A1B1E"
                                            />
                                        </Box>
                                        <Text size="xs" mt="xs" opacity={0.5} className="italic text-center">Digital signature for check-in acknowledgement</Text>
                                    </GlassCard>
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Stepper.Step>

                    {/* STEP 3: COMPLETED */}
                    <Stepper.Completed>
                        <Box py={80} className="text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring' }}
                            >
                                <Box className="bg-nordic-gold/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <IconCheck size={48} className="text-nordic-gold" />
                                </Box>
                                <Title order={1} className="italic mb-4">Registration Complete</Title>
                                <Text size="lg" className="max-w-md mx-auto opacity-70 mb-10">
                                    Your details have been successfully processed. We look forward to meeting you at {flightNumber}.
                                </Text>
                                <Button size="xl" color="gold" className="px-12 font-bold tracking-widest">GUEST DASHBOARD</Button>
                            </motion.div>
                        </Box>
                    </Stepper.Completed>
                </Stepper>

                {active < 2 && (
                    <Group justify="center" mt={60} gap="xl">
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={prevStep}
                            disabled={active === 0}
                            size="lg"
                            leftSection={<IconChevronLeft size={20} />}
                        >
                            PREVIOUS
                        </Button>
                        <Button
                            color="gold"
                            onClick={nextStep}
                            size="lg"
                            className="px-10 font-bold tracking-widest"
                            rightSection={<IconChevronRight size={20} />}
                            disabled={(active === 0 && !selectedVehicle) || (active === 1 && (!idFile || sigPad.current?.isEmpty()))}
                        >
                            CONTINUE
                        </Button>
                    </Group>
                )}
            </motion.div>
        </Container>
    );
};

export default GuestConcierge;
