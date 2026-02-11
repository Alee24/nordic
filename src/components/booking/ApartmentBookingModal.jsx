import React, { useState, useEffect } from 'react';
import { Modal, TextInput, NumberInput, Button, Group, Text, Stack, Checkbox, Select, Textarea, Divider, Grid } from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { createBooking } from '../../services/apartmentApi';
import { IconPlane, IconCar, IconClock, IconUsers, IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';

const ApartmentBookingModal = ({ opened, onClose, unit, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);

    const form = useForm({
        initialValues: {
            user_id: 'guest-123',
            user_name: '',
            email: '',
            phone: '',
            check_in: null,
            check_out: null,
            adults: 1,
            children: 0,
            flight_number: '',
            arrival_time: '',
            airport_pickup: false,
            late_checkout: false,
            special_requests: '',
        },
        validate: {
            check_in: (value) => !value ? 'Required' : null,
            check_out: (value) => !value ? 'Required' : null,
            user_name: (value) => !value ? 'Required' : null,
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            adults: (value) => value < 1 ? 'At least 1 adult required' : null,
        },
    });

    // Calculate price whenever dates change
    useEffect(() => {
        if (form.values.check_in && form.values.check_out && unit) {
            const start = dayjs(form.values.check_in);
            const end = dayjs(form.values.check_out);
            const nights = end.diff(start, 'day');

            if (nights > 0) {
                let price = nights * unit.base_price;
                if (form.values.late_checkout) price += unit.base_price * 0.5; // Half day charge
                if (form.values.airport_pickup) price += 50; // Flat rate
                setTotalPrice(price);
            } else {
                setTotalPrice(0);
            }
        }
    }, [form.values.check_in, form.values.check_out, form.values.late_checkout, form.values.airport_pickup, unit]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const bookingData = {
                ...values,
                unit_id: unit.id,
                total_price: totalPrice,
                check_in: values.check_in instanceof Date ? values.check_in.toISOString().split('T')[0] : new Date(values.check_in).toISOString().split('T')[0],
                check_out: values.check_out instanceof Date ? values.check_out.toISOString().split('T')[0] : new Date(values.check_out).toISOString().split('T')[0],
                arrival_time: values.arrival_time || null,
            };

            console.log("Submitting Booking:", bookingData);

            const response = await createBooking(bookingData);

            notifications.show({
                title: 'Request Received',
                message: 'Our concierge will confirm your detailed itinerary shortly.',
                color: 'green',
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Booking error:", error);
            notifications.show({
                title: 'Booking Failed',
                message: error.response?.data?.message || error.message || 'Something went wrong',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Text fw={700} size="xl" className="font-serif">Concierge Booking Request</Text>}
            centered
            size="xl"
            padding="xl"
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid gutter="xl">
                    {/* LEFT COLUMN: Unit & Guest Details */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack spacing="md">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <Text fw={700} size="lg" className="font-serif text-nordic-dark-900">Unit {unit?.id}</Text>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Floor {Math.floor(unit?.id / 100)} • {unit?.view_type === 'ocean' ? 'Ocean View' : 'City View'}</Text>
                                    <Text fw={700} c="orange" size="lg">${unit?.base_price} <span className="text-xs text-gray-500 font-normal">/ night</span></Text>
                                </Group>
                            </div>

                            <Text fw={700} size="sm" tt="uppercase" c="dimmed" mt="md">Guest Information</Text>
                            <TextInput
                                label="Full Name"
                                placeholder="Enter your full name"
                                withAsterisk
                                {...form.getInputProps('user_name')}
                            />
                            <TextInput
                                label="Email Address"
                                placeholder="name@example.com"
                                withAsterisk
                                {...form.getInputProps('email')}
                            />
                            <TextInput
                                label="Phone Number"
                                placeholder="+1 (555) 000-0000"
                                {...form.getInputProps('phone')}
                            />
                            <Group grow>
                                <NumberInput
                                    label="Adults"
                                    min={1}
                                    max={4}
                                    leftSection={<IconUsers size={16} />}
                                    {...form.getInputProps('adults')}
                                />
                                <NumberInput
                                    label="Children"
                                    min={0}
                                    max={3}
                                    leftSection={<IconUsers size={16} />}
                                    {...form.getInputProps('children')}
                                />
                            </Group>
                        </Stack>
                    </Grid.Col>

                    {/* RIGHT COLUMN: Dates & Travel Details */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack spacing="md">
                            <Text fw={700} size="sm" tt="uppercase" c="dimmed">Dates & Flight</Text>

                            <Group grow>
                                <DatePickerInput
                                    label="Check-in"
                                    placeholder="Arrival Date"
                                    minDate={new Date()}
                                    leftSection={<IconCalendar size={16} />}
                                    withAsterisk
                                    clearable
                                    {...form.getInputProps('check_in')}
                                />
                                <DatePickerInput
                                    label="Check-out"
                                    placeholder="Departure Date"
                                    minDate={form.values.check_in || new Date()}
                                    leftSection={<IconCalendar size={16} />}
                                    withAsterisk
                                    clearable
                                    {...form.getInputProps('check_out')}
                                />
                            </Group>

                            <Group grow>
                                <TextInput
                                    label="Flight Number"
                                    placeholder="e.g. KQ123"
                                    leftSection={<IconPlane size={16} />}
                                    {...form.getInputProps('flight_number')}
                                />
                                <TimeInput
                                    label="Arrival Time"
                                    leftSection={<IconClock size={16} />}
                                    {...form.getInputProps('arrival_time')}
                                />
                            </Group>

                            <Text fw={700} size="sm" tt="uppercase" c="dimmed" mt="md">Enhance Your Stay</Text>
                            <div className="space-y-3">
                                <Checkbox
                                    label="Airport Pickup (+$50)"
                                    description="Private chauffeur waiting at arrivals"
                                    {...form.getInputProps('airport_pickup', { type: 'checkbox' })}
                                />
                                <Checkbox
                                    label="Late Checkout (+$150)"
                                    description="Keep your room until 6:00 PM"
                                    {...form.getInputProps('late_checkout', { type: 'checkbox' })}
                                />
                            </div>

                            <Textarea
                                label="Special Requests"
                                placeholder="Dietary restrictions, allergies, or special occasions..."
                                minRows={2}
                                {...form.getInputProps('special_requests')}
                            />
                        </Stack>
                    </Grid.Col>
                </Grid>

                <Divider my="lg" />

                <Group justify="space-between" align="center">
                    <div>
                        <Text size="sm" c="dimmed">Total Estimated Cost</Text>
                        <Text size="3xl" fw={700} className="font-serif text-nordic-gold-600">
                            ${totalPrice.toLocaleString()}
                        </Text>
                        {(form.values.airport_pickup || form.values.late_checkout) && (
                            <Text size="xs" c="dimmed" fs="italic">*Includes selected add-ons</Text>
                        )}
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        color="yellow"
                        loading={loading}
                        className="bg-nordic-gold-500 text-nordic-dark-900 font-bold px-8 hover:bg-nordic-gold-400 transition-colors"
                    >
                        Request Booking
                    </Button>
                </Group>
            </form>
        </Modal>
    );
};

export default ApartmentBookingModal;
