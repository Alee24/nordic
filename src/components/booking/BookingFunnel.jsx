import React, { useState } from 'react';
import { Modal, Stepper, Button, Group, Box, Text, Title, Stack, Grid, TextInput, NumberInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconBed, IconUser, IconCreditCard, IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuiteCard from './SuiteCard';
import PaymentScreen from './PaymentScreen';
import useBookingStore from '../../store/useBookingStore';

const suites = [
    {
        id: 'norden-sky',
        title: 'Norden Sky Penthouse',
        price: 450,
        description: 'A panoramic sanctuary with floor-to-ceiling glass walls overlooking the city lights.',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop'],
        capacity: 2,
        features: ['wifi', 'coffee', 'concierge']
    },
    {
        id: 'frost-haven',
        title: 'Frost Haven Studio',
        price: 280,
        description: 'Minimalist Scandi-luxury with a private sauna and bespoke timber finishes.',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop'],
        capacity: 2,
        features: ['wifi', 'coffee']
    }
];

const BookingFunnel = ({ opened, onClose }) => {
    const [active, setActive] = useState(0);
    const { activeBooking, startBooking, confirmSuite, saveBooking, isSyncing } = useBookingStore();
    const [guestData, setGuestData] = useState({ name: '', email: '' });

    const nextStep = async () => {
        if (active === 0) {
            startBooking({ dates: [new Date(), new Date(new Date().getTime() + 86400000)], guests: 2 });
            setActive(1);
        } else if (active === 1) {
            setActive(2);
        } else if (active === 2) {
            const success = await saveBooking(guestData);
            if (success) setActive(3);
        }
    };

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="70%"
            radius="lg"
            withCloseButton={false}
            styles={{
                content: {
                    backgroundColor: 'rgba(26, 27, 30, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(225, 232, 235, 0.1)',
                },
                body: { padding: '2rem' }
            }}
        >
            <Stack gap="xl">
                <Group justify="space-between">
                    <Box>
                        <Title order={2} className="font-serif italic text-3xl">Reserve Your Sanctuary</Title>
                        <Text size="sm" className="text-norden-frost/60">The journey to quiet luxury begins here.</Text>
                    </Box>
                    <Button variant="subtle" color="gray" onClick={onClose} radius="xl">CLOSE</Button>
                </Group>

                <Stepper
                    active={active}
                    onStepClick={setActive}
                    color="gold"
                    allowNextStepsSelect={false}
                    styles={{
                        stepIcon: { border: '1px solid rgba(212, 175, 55, 0.2)' }
                    }}
                >
                    <Stepper.Step label="Arrival" description="Choose dates" icon={<IconCalendar size={18} />}>
                        <Box mt="xl">
                            <DatePickerInput
                                type="range"
                                label="Duration of Stay"
                                placeholder="Pick check-in and check-out dates"
                                size="lg"
                                variant="filled"
                                mb="xl"
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)' }
                                }}
                            />
                            <NumberInput
                                label="Number of Guests"
                                defaultValue={2}
                                size="lg"
                                variant="filled"
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)' }
                                }}
                            />
                        </Box>
                    </Stepper.Step>

                    <Stepper.Step label="Suite" description="Select sanctuary" icon={<IconBed size={18} />}>
                        <Grid mt="xl">
                            {suites.map((suite) => (
                                <Grid.Col span={{ base: 12, md: 6 }} key={suite.id}>
                                    <SuiteCard
                                        {...suite}
                                        isSelected={activeBooking?.suite?.id === suite.id}
                                        onSelect={() => confirmSuite(suite)}
                                    />
                                </Grid.Col>
                            ))}
                        </Grid>
                    </Stepper.Step>

                    <Stepper.Step label="Identity" description="Guest details" icon={<IconUser size={18} />}>
                        <Stack mt="xl" gap="md">
                            <TextInput
                                label="Full Name"
                                placeholder="The Distinguished Guest"
                                size="lg"
                                variant="filled"
                                value={guestData.name}
                                onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)' }
                                }}
                            />
                            <TextInput
                                label="Private Email"
                                placeholder="contact@example.com"
                                size="lg"
                                variant="filled"
                                value={guestData.email}
                                onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)' }
                                }}
                            />
                        </Stack>
                    </Stepper.Step>

                    <Stepper.Step label="Payment" description="Secure billing" icon={<IconCreditCard size={18} />}>
                        <Box mt="xl">
                            <PaymentScreen
                                bookingData={{ ...activeBooking, guest_name: guestData.name, guest_email: guestData.email }}
                                onComplete={onClose}
                            />
                        </Box>
                    </Stepper.Step>
                </Stepper>

                {active < 3 && (
                    <Group justify="flex-end" mt="xl">
                        {active !== 0 && (
                            <Button variant="default" onClick={prevStep} leftSection={<IconChevronLeft size={16} />}>
                                BACK
                            </Button>
                        )}
                        <Button
                            onClick={nextStep}
                            loading={isSyncing}
                            disabled={(active === 1 && !activeBooking?.suite) || (active === 2 && (!guestData.name || !guestData.email))}
                            rightSection={<IconChevronRight size={16} />}
                            className="bg-norden-gold text-norden-dark hover:bg-norden-gold/90"
                        >
                            CONTINUE
                        </Button>
                    </Group>
                )}
            </Stack>
        </Modal>
    );
};

export default BookingFunnel;
