import React, { useState, useEffect, useMemo } from 'react';
import {
    Modal, Stepper, TextInput, Textarea, Button, Stack,
    Text, Group, ThemeIcon, Box, Card, Image,
    Badge, ScrollArea, Loader, Center, Divider, Radio, Alert, Paper,
    NumberInput, Select
} from '@mantine/core';
import {
    IconMail, IconPhone, IconUser, IconCalendar,
    IconMessage2, IconCheck, IconChevronRight,
    IconChevronLeft, IconHome, IconCreditCard,
    IconDeviceMobile, IconAlertCircle, IconMoon,
    IconCurrencyDollar, IconUsers, IconBed, IconSparkles,
    IconCircleCheck, IconX
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import useBookingSystemStore from '../../store/useBookingSystemStore';
import CustomDateInput from './CustomDateInput';

const BookingFlowModal = ({ opened, onClose, initialDates = [null, null], initialGuests = 1 }) => {
    const {
        propertyRooms,
        fetchPropertyRooms,
        createBooking,
        isLoading
    } = useBookingSystemStore();

    const [active, setActive] = useState(0);
    const [dates, setDates] = useState(initialDates);
    const [guests, setGuests] = useState(initialGuests);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        email: '',
        phone: '',
        specialRequests: ''
    });
    const [bookingResult, setBookingResult] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate number of nights
    const numberOfNights = useMemo(() => {
        try {
            if (!dates[0] || !dates[1]) return 0;
            if (!(dates[0] instanceof Date) || !(dates[1] instanceof Date)) return 0;
            if (isNaN(dates[0].getTime()) || isNaN(dates[1].getTime())) return 0;
            const diffTime = Math.abs(dates[1].getTime() - dates[0].getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (error) {
            console.error('Error calculating nights:', error);
            return 0;
        }
    }, [dates[0]?.getTime(), dates[1]?.getTime()]);

    // Calculate total price
    const totalPrice = useMemo(() => {
        if (!selectedRoom || numberOfNights === 0) return 0;
        return selectedRoom.base_price * numberOfNights;
    }, [selectedRoom, numberOfNights]);

    // Reset state when modal opens
    useEffect(() => {
        if (opened) {
            setDates(initialDates);
            setGuests(initialGuests);
            setActive(0);
            setSelectedRoom(null);
            setGuestInfo({ name: '', email: '', phone: '', specialRequests: '' });
            setErrors({});
            setBookingResult(null);
            setIsSubmitting(false);
        }
    }, [opened]);

    // Fetch rooms when moving to room selection step
    useEffect(() => {
        if (opened && active === 1 && dates[0] && dates[1]) {
            const checkIn = dates[0].toISOString().split('T')[0];
            const checkOut = dates[1].toISOString().split('T')[0];
            fetchPropertyRooms('nordic-main', checkIn, checkOut);
        }
    }, [opened, active]);

    const nextStep = () => {
        if (active === 0 && !validateDates()) return;
        if (active === 1 && !selectedRoom) {
            notifications.show({
                title: 'Room Required',
                message: 'Please select a room to continue',
                color: 'orange',
                icon: <IconAlertCircle size={18} />
            });
            return;
        }
        if (active === 2 && !validateGuestInfo()) return;

        setActive((current) => (current < 4 ? current + 1 : current));
    };

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const validateDates = () => {
        const newErrors = {};
        if (!dates[0]) newErrors.checkIn = 'Check-in date is required';
        if (!dates[1]) newErrors.checkOut = 'Check-out date is required';
        if (dates[0] && dates[1] && dates[1] <= dates[0]) {
            newErrors.checkOut = 'Check-out must be after check-in';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateGuestInfo = () => {
        const newErrors = {};
        if (!guestInfo.name.trim()) newErrors.name = 'Name is required';
        if (!guestInfo.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) newErrors.email = 'Invalid email format';
        if (!guestInfo.phone.trim()) newErrors.phone = 'Phone number is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateBooking = async () => {
        if (!selectedRoom || !dates[0] || !dates[1]) return;

        setIsSubmitting(true);

        const bookingData = {
            property_id: 'nordic-main',
            room_id: selectedRoom.id,
            check_in: dates[0].toISOString().split('T')[0],
            check_out: dates[1].toISOString().split('T')[0],
            num_adults: guests,
            num_children: 0,
            user_id: localStorage.getItem('user_id'),
            guest_name: guestInfo.name,
            guest_email: guestInfo.email,
            guest_phone: guestInfo.phone,
            special_requests: guestInfo.specialRequests
        };

        try {
            const result = await createBooking(bookingData);
            setBookingResult(result);
            setIsSubmitting(false);
            nextStep();
        } catch (error) {
            console.error("Booking creation failed", error);
            setIsSubmitting(false);
            notifications.show({
                title: 'Booking Failed',
                message: error.message || 'Unable to create booking. Please try again.',
                color: 'red',
                icon: <IconAlertCircle size={18} />
            });
        }
    };

    const handlePaymentSubmit = async () => {
        notifications.show({
            title: 'Success!',
            message: `Your booking ${bookingResult?.booking_reference} has been confirmed!`,
            color: 'green',
            icon: <IconCircleCheck size={18} />,
            autoClose: 5000
        });

        setTimeout(() => {
            onClose();
            setActive(0);
            setBookingResult(null);
        }, 1500);
    };

    const renderStepContent = () => {
        switch (active) {
            case 0: // Dates & Guests
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Stack gap="xl" py="md">
                            <Box>
                                <Group gap="xs" mb="md">
                                    <ThemeIcon size="lg" radius="xl" variant="light" color="gold">
                                        <IconCalendar size={20} />
                                    </ThemeIcon>
                                    <Text fw={700} size="xl" c="dark.8">Select Your Dates</Text>
                                </Group>
                                <Text size="sm" c="dimmed" mb="lg">
                                    Choose your check-in and check-out dates to see available suites
                                </Text>

                                <Stack gap="md">
                                    <CustomDateInput
                                        label="Check-in Date"
                                        value={dates[0]}
                                        onChange={(val) => {
                                            setDates([val, dates[1]]);
                                            setErrors({ ...errors, checkIn: null });
                                        }}
                                        minDate={new Date()}
                                        error={errors.checkIn}
                                        required
                                        placeholder="Select arrival date"
                                    />

                                    <CustomDateInput
                                        label="Check-out Date"
                                        value={dates[1]}
                                        onChange={(val) => {
                                            setDates([dates[0], val]);
                                            setErrors({ ...errors, checkOut: null });
                                        }}
                                        minDate={dates[0] ? new Date(dates[0].getTime() + 86400000) : new Date()}
                                        error={errors.checkOut}
                                        required
                                        placeholder="Select departure date"
                                    />

                                    {numberOfNights > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Paper p="lg" withBorder radius="md" className="bg-gradient-to-r from-norden-gold-50 to-norden-gold-100 border-norden-gold-200">
                                                <Group justify="space-between">
                                                    <Group gap="sm">
                                                        <ThemeIcon size="xl" radius="xl" variant="light" color="gold">
                                                            <IconMoon size={24} />
                                                        </ThemeIcon>
                                                        <Box>
                                                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Duration</Text>
                                                            <Text fw={800} size="xl" c="gold.8">
                                                                {numberOfNights} {numberOfNights === 1 ? 'Night' : 'Nights'}
                                                            </Text>
                                                        </Box>
                                                    </Group>
                                                </Group>
                                            </Paper>
                                        </motion.div>
                                    )}
                                </Stack>
                            </Box>

                            <Divider />

                            <Box>
                                <Group gap="xs" mb="md">
                                    <ThemeIcon size="lg" radius="xl" variant="light" color="gold">
                                        <IconUsers size={20} />
                                    </ThemeIcon>
                                    <Text fw={700} size="xl" c="dark.8">Number of Guests</Text>
                                </Group>

                                <NumberInput
                                    value={guests}
                                    onChange={(val) => setGuests(val || 1)}
                                    min={1}
                                    max={6}
                                    size="lg"
                                    leftSection={<IconUsers size={18} />}
                                    description="Maximum 6 guests per suite"
                                    styles={{
                                        input: { '&:focus': { borderColor: 'var(--mantine-color-gold-6)' } }
                                    }}
                                />
                            </Box>
                        </Stack>
                    </motion.div>
                );

            case 1: // Room Selection
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Stack gap="md" py="md">
                            <Group gap="xs" mb="xs">
                                <ThemeIcon size="lg" radius="xl" variant="light" color="gold">
                                    <IconBed size={20} />
                                </ThemeIcon>
                                <Text fw={700} size="xl" c="dark.8">Choose Your Suite</Text>
                            </Group>
                            <Text size="sm" c="dimmed" mb="md">
                                Select from our luxury accommodations for {numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}
                            </Text>

                            <ScrollArea h={400} type="auto">
                                {isLoading ? (
                                    <Center h={300}>
                                        <Stack align="center" gap="md">
                                            <Loader size="lg" color="gold" />
                                            <Text c="dimmed">Loading available suites...</Text>
                                        </Stack>
                                    </Center>
                                ) : propertyRooms.length === 0 ? (
                                    <Center h={300}>
                                        <Stack align="center" gap="md">
                                            <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                                                <IconAlertCircle size={30} />
                                            </ThemeIcon>
                                            <Text c="dimmed" ta="center">
                                                No suites available for selected dates.<br />
                                                Please try different dates.
                                            </Text>
                                        </Stack>
                                    </Center>
                                ) : (
                                    <Stack gap="md">
                                        {propertyRooms.map((room) => (
                                            <motion.div
                                                key={room.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Card
                                                    withBorder
                                                    padding="lg"
                                                    radius="md"
                                                    className={`cursor-pointer transition-all ${selectedRoom?.id === room.id
                                                        ? 'border-norden-gold-500 bg-gradient-to-br from-norden-gold-50 to-white shadow-xl'
                                                        : 'hover:border-norden-gold-300 hover:shadow-lg'
                                                        }`}
                                                    onClick={() => setSelectedRoom(room)}
                                                >
                                                    <Group wrap="nowrap" align="flex-start" gap="lg">
                                                        <Image
                                                            src={room.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'}
                                                            h={120}
                                                            w={160}
                                                            radius="md"
                                                            fit="cover"
                                                        />
                                                        <Box style={{ flex: 1 }}>
                                                            <Group justify="space-between" mb="xs">
                                                                <Text fw={700} size="lg" c="dark.8">{room.name}</Text>
                                                                {selectedRoom?.id === room.id && (
                                                                    <ThemeIcon color="gold" radius="xl" size="lg" variant="light">
                                                                        <IconCheck size={18} />
                                                                    </ThemeIcon>
                                                                )}
                                                            </Group>
                                                            <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
                                                                {room.description}
                                                            </Text>
                                                            <Group gap="xs" mb="md">
                                                                <Badge size="sm" variant="light" color="gold" leftSection={<IconSparkles size={12} />}>
                                                                    {room.room_type?.replace('_', ' ')}
                                                                </Badge>
                                                                <Badge size="sm" variant="light" color="blue">
                                                                    {room.max_occupancy} Guests
                                                                </Badge>
                                                                <Badge size="sm" variant="light" color="gray">
                                                                    {room.size_sqm} m²
                                                                </Badge>
                                                            </Group>
                                                            <Group justify="space-between" align="flex-end">
                                                                <Box>
                                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Per Night</Text>
                                                                    <Text fw={800} size="lg" c="gold.8">
                                                                        KES {room.base_price?.toLocaleString()}
                                                                    </Text>
                                                                </Box>
                                                                <Box ta="right">
                                                                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                                                        Total ({numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'})
                                                                    </Text>
                                                                    <Text fw={900} size="xl" c="gold.8">
                                                                        KES {(room.base_price * numberOfNights)?.toLocaleString()}
                                                                    </Text>
                                                                </Box>
                                                            </Group>
                                                        </Box>
                                                    </Group>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </Stack>
                                )}
                            </ScrollArea>
                        </Stack>
                    </motion.div>
                );

            case 2: // Guest Information
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Stack gap="xl" py="md">
                            <Box>
                                <Group gap="xs" mb="md">
                                    <ThemeIcon size="lg" radius="xl" variant="light" color="gold">
                                        <IconUser size={20} />
                                    </ThemeIcon>
                                    <Text fw={700} size="xl" c="dark.8">Guest Information</Text>
                                </Group>
                                <Text size="sm" c="dimmed" mb="lg">
                                    Please provide your contact details for the reservation
                                </Text>

                                <Stack gap="md">
                                    <TextInput
                                        label="Full Name"
                                        placeholder="John Doe"
                                        value={guestInfo.name}
                                        onChange={(e) => {
                                            setGuestInfo({ ...guestInfo, name: e.target.value });
                                            setErrors({ ...errors, name: null });
                                        }}
                                        leftSection={<IconUser size={18} />}
                                        size="lg"
                                        error={errors.name}
                                        styles={{
                                            input: { '&:focus': { borderColor: 'var(--mantine-color-gold-6)' } }
                                        }}
                                        required
                                    />

                                    <TextInput
                                        label="Email Address"
                                        placeholder="john@example.com"
                                        value={guestInfo.email}
                                        onChange={(e) => {
                                            setGuestInfo({ ...guestInfo, email: e.target.value });
                                            setErrors({ ...errors, email: null });
                                        }}
                                        leftSection={<IconMail size={18} />}
                                        size="lg"
                                        error={errors.email}
                                        styles={{
                                            input: { '&:focus': { borderColor: 'var(--mantine-color-gold-6)' } }
                                        }}
                                        required
                                    />

                                    <TextInput
                                        label="Phone Number"
                                        placeholder="+254 700 000 000"
                                        value={guestInfo.phone}
                                        onChange={(e) => {
                                            setGuestInfo({ ...guestInfo, phone: e.target.value });
                                            setErrors({ ...errors, phone: null });
                                        }}
                                        leftSection={<IconPhone size={18} />}
                                        size="lg"
                                        error={errors.phone}
                                        styles={{
                                            input: { '&:focus': { borderColor: 'var(--mantine-color-gold-6)' } }
                                        }}
                                        required
                                    />

                                    <Textarea
                                        label="Special Requests"
                                        placeholder="Any special requirements or preferences..."
                                        value={guestInfo.specialRequests}
                                        onChange={(e) => setGuestInfo({ ...guestInfo, specialRequests: e.target.value })}
                                        leftSection={<IconMessage2 size={18} />}
                                        size="lg"
                                        minRows={3}
                                        styles={{
                                            input: { '&:focus': { borderColor: 'var(--mantine-color-gold-6)' } }
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    </motion.div>
                );

            case 3: // Review & Confirm
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Stack gap="xl" py="md">
                            <Box>
                                <Group gap="xs" mb="md">
                                    <ThemeIcon size="lg" radius="xl" variant="light" color="gold">
                                        <IconCircleCheck size={20} />
                                    </ThemeIcon>
                                    <Text fw={700} size="xl" c="dark.8">Review Your Booking</Text>
                                </Group>
                                <Text size="sm" c="dimmed" mb="lg">
                                    Please review all details before confirming
                                </Text>

                                <Card withBorder radius="md" p="xl" className="bg-gradient-to-br from-gray-50 to-white">
                                    <Stack gap="lg">
                                        {/* Suite Details */}
                                        <Box>
                                            <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">Selected Suite</Text>
                                            <Group justify="space-between">
                                                <Text fw={700} size="lg">{selectedRoom?.name}</Text>
                                                <Badge size="lg" variant="light" color="gold">{selectedRoom?.room_type?.replace('_', ' ')}</Badge>
                                            </Group>
                                        </Box>

                                        <Divider />

                                        {/* Dates */}
                                        <Box>
                                            <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">Stay Details</Text>
                                            <Stack gap="xs">
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Check-in:</Text>
                                                    <Text fw={600}>{dates[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Check-out:</Text>
                                                    <Text fw={600}>{dates[1]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Duration:</Text>
                                                    <Text fw={600}>{numberOfNights} {numberOfNights === 1 ? 'Night' : 'Nights'}</Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Guests:</Text>
                                                    <Text fw={600}>{guests} {guests === 1 ? 'Guest' : 'Guests'}</Text>
                                                </Group>
                                            </Stack>
                                        </Box>

                                        <Divider />

                                        {/* Guest Info */}
                                        <Box>
                                            <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">Guest Information</Text>
                                            <Stack gap="xs">
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Name:</Text>
                                                    <Text fw={600}>{guestInfo.name}</Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Email:</Text>
                                                    <Text fw={600} size="sm">{guestInfo.email}</Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="sm" c="dimmed">Phone:</Text>
                                                    <Text fw={600}>{guestInfo.phone}</Text>
                                                </Group>
                                            </Stack>
                                        </Box>

                                        <Divider />

                                        {/* Price Breakdown */}
                                        <Box className="bg-gradient-to-r from-norden-gold-50 to-norden-gold-100 p-4 rounded-lg">
                                            <Text size="xs" tt="uppercase" fw={700} c="gold.8" mb="sm">Price Summary</Text>
                                            <Stack gap="xs">
                                                <Group justify="space-between">
                                                    <Text fw={500}>Rate per night:</Text>
                                                    <Text fw={600}>KES {selectedRoom?.base_price?.toLocaleString()}</Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text fw={500}>Number of nights:</Text>
                                                    <Text fw={600}>× {numberOfNights}</Text>
                                                </Group>
                                                <Divider my="xs" />
                                                <Group justify="space-between">
                                                    <Text fw={800} size="lg">Total Amount:</Text>
                                                    <Text fw={900} size="xl" c="gold.8">KES {totalPrice?.toLocaleString()}</Text>
                                                </Group>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Box>
                        </Stack>
                    </motion.div>
                );

            case 4: // Payment
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Stack gap="xl" py="md">
                            {bookingResult && (
                                <Alert icon={<IconCircleCheck size={20} />} title="Booking Confirmed!" color="green" radius="md">
                                    <Text size="sm">
                                        Your booking reference: <Text component="span" fw={700}>{bookingResult.booking_reference}</Text>
                                    </Text>
                                </Alert>
                            )}

                            <Box>
                                <Group gap="xs" mb="md">
                                    <ThemeIcon size="lg" radius="xl" variant="light" color="gold">
                                        <IconCreditCard size={20} />
                                    </ThemeIcon>
                                    <Text fw={700} size="xl" c="dark.8">Payment Method</Text>
                                </Group>
                                <Text size="sm" c="dimmed" mb="lg">
                                    Choose how you'd like to complete your payment
                                </Text>

                                <Radio.Group value={paymentMethod} onChange={setPaymentMethod}>
                                    <Stack gap="sm">
                                        <Card withBorder padding="md" radius="md" className={paymentMethod === 'mpesa' ? 'border-norden-gold-500 bg-norden-gold-50' : ''}>
                                            <Radio
                                                value="mpesa"
                                                label={
                                                    <Group gap="sm">
                                                        <ThemeIcon size="lg" radius="md" variant="light" color="green">
                                                            <IconDeviceMobile size={20} />
                                                        </ThemeIcon>
                                                        <Box>
                                                            <Text fw={600}>M-Pesa</Text>
                                                            <Text size="xs" c="dimmed">Pay with your mobile money</Text>
                                                        </Box>
                                                    </Group>
                                                }
                                            />
                                        </Card>

                                        <Card withBorder padding="md" radius="md" className={paymentMethod === 'card' ? 'border-norden-gold-500 bg-norden-gold-50' : ''}>
                                            <Radio
                                                value="card"
                                                label={
                                                    <Group gap="sm">
                                                        <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                                                            <IconCreditCard size={20} />
                                                        </ThemeIcon>
                                                        <Box>
                                                            <Text fw={600}>Credit/Debit Card</Text>
                                                            <Text size="xs" c="dimmed">Pay with Visa, Mastercard, or Amex</Text>
                                                        </Box>
                                                    </Group>
                                                }
                                            />
                                        </Card>

                                        <Card withBorder padding="md" radius="md" className={paymentMethod === 'later' ? 'border-norden-gold-500 bg-norden-gold-50' : ''}>
                                            <Radio
                                                value="later"
                                                label={
                                                    <Group gap="sm">
                                                        <ThemeIcon size="lg" radius="md" variant="light" color="gray">
                                                            <IconCurrencyDollar size={20} />
                                                        </ThemeIcon>
                                                        <Box>
                                                            <Text fw={600}>Pay Later</Text>
                                                            <Text size="xs" c="dimmed">Pay at the property upon arrival</Text>
                                                        </Box>
                                                    </Group>
                                                }
                                            />
                                        </Card>
                                    </Stack>
                                </Radio.Group>

                                <Paper p="lg" withBorder radius="md" mt="xl" className="bg-gradient-to-r from-norden-gold-50 to-norden-gold-100">
                                    <Group justify="space-between" align="center">
                                        <Box>
                                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total Amount</Text>
                                            <Text fw={900} size="xl" c="gold.8">KES {totalPrice?.toLocaleString()}</Text>
                                        </Box>
                                        <Button
                                            size="lg"
                                            color="gold"
                                            leftSection={<IconCircleCheck size={20} />}
                                            onClick={handlePaymentSubmit}
                                            className="bg-gradient-to-r from-norden-gold-500 to-norden-gold-600 hover:from-norden-gold-600 hover:to-norden-gold-700"
                                        >
                                            Complete Booking
                                        </Button>
                                    </Group>
                                </Paper>
                            </Box>
                        </Stack>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="sm">
                    <ThemeIcon size="xl" radius="md" variant="gradient" gradient={{ from: 'gold', to: 'yellow' }}>
                        <IconHome size={24} />
                    </ThemeIcon>
                    <Box>
                        <Text fw={800} size="xl">Reserve Your Residence</Text>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Norden Suits Coastal Luxury</Text>
                    </Box>
                </Group>
            }
            size="xl"
            centered
            padding="xl"
            radius="md"
            overlayProps={{ opacity: 0.55, blur: 3 }}
            styles={{
                header: { borderBottom: '1px solid var(--mantine-color-gray-2)', paddingBottom: '1rem' },
                body: { padding: '1.5rem' }
            }}
        >
            <Stack gap="xl">
                <Stepper
                    active={active}
                    onStepClick={setActive}
                    size="sm"
                    color="gold"
                    completedIcon={<IconCircleCheck size={18} />}
                    styles={{
                        stepIcon: {
                            borderWidth: 2,
                            '&[data-completed]': {
                                background: 'linear-gradient(135deg, var(--mantine-color-gold-5), var(--mantine-color-gold-6))',
                                borderColor: 'var(--mantine-color-gold-6)'
                            }
                        }
                    }}
                >
                    <Stepper.Step label="Dates" icon={<IconCalendar size={18} />} />
                    <Stepper.Step label="Suite" icon={<IconHome size={18} />} />
                    <Stepper.Step label="Details" icon={<IconUser size={18} />} />
                    <Stepper.Step label="Review" icon={<IconCheck size={18} />} />
                    <Stepper.Step label="Payment" icon={<IconCreditCard size={18} />} />
                </Stepper>

                <Box>
                    <AnimatePresence mode="wait">
                        {renderStepContent()}
                    </AnimatePresence>
                </Box>

                <Group justify="space-between" mt="xl">
                    {active > 0 && active < 4 && (
                        <Button
                            variant="default"
                            leftSection={<IconChevronLeft size={18} />}
                            onClick={prevStep}
                            size="lg"
                        >
                            Back
                        </Button>
                    )}
                    {active < 3 && (
                        <Button
                            ml="auto"
                            rightSection={<IconChevronRight size={18} />}
                            onClick={nextStep}
                            size="lg"
                            color="gold"
                            className="bg-gradient-to-r from-norden-gold-500 to-norden-gold-600 hover:from-norden-gold-600 hover:to-norden-gold-700"
                        >
                            {active === 0 ? 'Find Available Suites' : 'Continue'}
                        </Button>
                    )}
                    {active === 3 && (
                        <Button
                            ml="auto"
                            rightSection={<IconChevronRight size={18} />}
                            onClick={handleCreateBooking}
                            loading={isSubmitting}
                            size="lg"
                            color="gold"
                            className="bg-gradient-to-r from-norden-gold-500 to-norden-gold-600 hover:from-norden-gold-600 hover:to-norden-gold-700"
                        >
                            Confirm Booking
                        </Button>
                    )}
                </Group>
            </Stack>
        </Modal>
    );
};

export default BookingFlowModal;
