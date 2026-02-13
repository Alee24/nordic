import React, { useState, useEffect } from 'react';
import { Modal, Stepper, Button, Group, Box, Text, Title, Stack, Grid, TextInput, NumberInput, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconBed, IconUser, IconCreditCard, IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import BookableRoomCard from '../ui/BookableRoomCard';
import useRoomBookingStore from '../../store/useRoomBookingStore';
import { notifications } from '@mantine/notifications';

const RoomBookingFunnel = ({ opened, onClose, preselectedRoom = null }) => {
    const [active, setActive] = useState(0);
    const {
        availableRooms,
        activeBooking,
        isLoading,
        fetchRooms,
        startBooking,
        confirmRoom,
        saveBooking,
        resetBooking
    } = useRoomBookingStore();

    const [dateRange, setDateRange] = useState([null, null]);
    const [numGuests, setNumGuests] = useState(1);
    const [guestData, setGuestData] = useState({
        name: '',
        email: '',
        phone: '',
        special_requests: ''
    });

    // Load rooms when modal opens
    useEffect(() => {
        if (opened && availableRooms.length === 0) {
            fetchRooms();
        }
    }, [opened]);

    // If a room is preselected, skip to step 2? Or just set it. 
    // Actually, normally we want to select dates first to check availability.
    // For this flow, let's keep it simple: Select Date -> Select Room (filtered) -> Details
    // If preselected, we can just highlight it or auto-select after date pick if valid.

    // For now, let's stick to the flow: 0. Dates -> 1. Room -> 2. Details -> 3. Payment

    const nextStep = async () => {
        if (active === 0) {
            // Validate dates
            if (!dateRange[0] || !dateRange[1]) {
                notifications.show({ title: 'Date Selection', message: 'Please select check-in and check-out dates', color: 'red' });
                return;
            }

            const checkIn = dateRange[0].toISOString().split('T')[0];
            const checkOut = dateRange[1].toISOString().split('T')[0];
            const nights = Math.ceil((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24));

            if (nights < 1) {
                notifications.show({ title: 'Invalid Duration', message: 'Stay must be at least 1 night', color: 'red' });
                return;
            }

            startBooking({
                check_in: checkIn,
                check_out: checkOut,
                num_guests: numGuests,
                nights
            });
            setActive(1);
        } else if (active === 1) {
            if (!activeBooking?.suite) {
                notifications.show({ title: 'Room Selection', message: 'Please select a room', color: 'red' });
                return;
            }
            setActive(2);
        } else if (active === 2) {
            if (!guestData.name || !guestData.email) {
                notifications.show({ title: 'Guest Details', message: 'Please fill in required fields', color: 'red' });
                return;
            }
            const success = await saveBooking(guestData);
            if (success) setActive(3); // Go to Payment (mock or real)
        }
    };

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const handleClose = () => {
        resetBooking();
        setActive(0);
        setDateRange([null, null]);
        setNumGuests(1);
        setGuestData({ name: '', email: '', phone: '', special_requests: '' });
        onClose();
    };

    const handleSelectRoom = (room) => {
        confirmRoom(room);
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            size="80%"
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
                        <Title order={2} className="font-serif italic text-3xl text-white">Book Your Stay</Title>
                        <Text size="sm" className="text-norden-gold-400/80">Experience luxury at Norden Suits.</Text>
                    </Box>
                    <Button variant="subtle" color="gray" onClick={handleClose} radius="xl">CLOSE</Button>
                </Group>

                <Stepper
                    active={active}
                    onStepClick={setActive}
                    color="yellow"
                    allowNextStepsSelect={false}
                    styles={{
                        stepIcon: { border: '1px solid rgba(212, 175, 55, 0.2)' }
                    }}
                >
                    <Stepper.Step label="Dates" description="When are you visiting?" icon={<IconCalendar size={18} />}>
                        <Box mt="xl">
                            <DatePickerInput
                                type="range"
                                label="Duration of Stay"
                                placeholder="Pick check-in and check-out dates"
                                value={dateRange}
                                onChange={setDateRange}
                                size="lg"
                                variant="filled"
                                mb="xl"
                                minDate={new Date()}
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'white' }
                                }}
                            />
                            <NumberInput
                                label="Number of Guests"
                                value={numGuests}
                                onChange={setNumGuests}
                                min={1}
                                max={6}
                                size="lg"
                                variant="filled"
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'white' }
                                }}
                            />
                        </Box>
                    </Stepper.Step>

                    <Stepper.Step label="Room" description="Select your suite" icon={<IconBed size={18} />}>
                        <Box mt="xl">
                            {isLoading ? (
                                <Text className="text-center py-10 text-white">Loading available rooms...</Text>
                            ) : (
                                <Grid>
                                    {availableRooms
                                        .filter(room => room.capacity >= numGuests)
                                        .map((room) => (
                                            <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={room.id}>
                                                <div
                                                    onClick={() => handleSelectRoom(room)}
                                                    className={`cursor-pointer transition-all ${activeBooking?.suite?.id === room.id
                                                        ? 'ring-2 ring-norden-gold-500 rounded-xl transform scale-[1.02]'
                                                        : ''
                                                        }`}
                                                >
                                                    <BookableRoomCard
                                                        room={room}
                                                        onBookNow={() => handleSelectRoom(room)}
                                                    />
                                                </div>
                                            </Grid.Col>
                                        ))}
                                </Grid>
                            )}
                        </Box>
                    </Stepper.Step>

                    <Stepper.Step label="Details" description="Guest information" icon={<IconUser size={18} />}>
                        <Stack mt="xl" gap="md">
                            <TextInput
                                label="Full Name"
                                placeholder="Your full name"
                                size="lg"
                                variant="filled"
                                value={guestData.name}
                                onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                                required
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'white' },
                                    label: { color: 'white' }
                                }}
                            />
                            <TextInput
                                label="Email Address"
                                placeholder="your.email@example.com"
                                size="lg"
                                variant="filled"
                                type="email"
                                value={guestData.email}
                                onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                                required
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'white' },
                                    label: { color: 'white' }
                                }}
                            />
                            <TextInput
                                label="Phone Number"
                                placeholder="07XXXXXXXX"
                                size="lg"
                                variant="filled"
                                value={guestData.phone}
                                onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'white' },
                                    label: { color: 'white' }
                                }}
                            />
                            <Textarea
                                label="Special Requests (Optional)"
                                placeholder="Any special requirements..."
                                size="lg"
                                variant="filled"
                                value={guestData.special_requests}
                                onChange={(e) => setGuestData({ ...guestData, special_requests: e.target.value })}
                                minRows={3}
                                styles={{
                                    input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'white' },
                                    label: { color: 'white' }
                                }}
                            />
                        </Stack>
                    </Stepper.Step>

                    <Stepper.Step label="Payment" description="Secure checkout" icon={<IconCreditCard size={18} />}>
                        {/* Simple Success/Payment Placeholder for now */}
                        <Stack align="center" py="xl">
                            <Text color="white" size="xl">Booking Created Successfully!</Text>
                            <Text color="dimmed">Your Booking ID is: {activeBooking?.booking_id}</Text>
                            <Text color="dimmed">Total to Pay: ${activeBooking?.total_price?.toLocaleString()}</Text>
                            <Button onClick={handleClose} mt="lg" color="green">Complete & Close</Button>
                        </Stack>
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
                            loading={isLoading}
                            rightSection={<IconChevronRight size={16} />}
                            className="bg-norden-gold text-norden-dark hover:bg-norden-gold/90"
                        >
                            {active === 2 ? 'CONFIRM BOOKING' : 'CONTINUE'}
                        </Button>
                    </Group>
                )}
            </Stack>
        </Modal>
    );
};

export default RoomBookingFunnel;
