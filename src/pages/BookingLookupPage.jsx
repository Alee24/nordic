import React, { useState } from 'react';
import { Container, Paper, TextInput, Button, Stack, Text, Card, Group, Badge, Divider, Loader, Center, Alert } from '@mantine/core';
import { IconSearch, IconMail, IconCalendar, IconHome, IconCurrencyDollar, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

const BookingLookupPage = () => {
    const [bookingId, setBookingId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);

    const handleLookup = async () => {
        if (!bookingId || !email) {
            notifications.show({
                title: 'Missing Information',
                message: 'Please enter both booking ID and email address',
                color: 'red',
                icon: <IconAlertCircle size={18} />,
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost/NORDIC/backend/api/bookings.php/lookup`,
                {
                    params: { booking_id: bookingId, email: email }
                }
            );

            if (response.data.success) {
                setBooking(response.data.data);
                notifications.show({
                    title: 'Booking Found',
                    message: 'Your booking details have been retrieved',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
            } else {
                notifications.show({
                    title: 'Booking Not Found',
                    message: response.data.message || 'Please check your booking ID and email',
                    color: 'red',
                });
                setBooking(null);
            }
        } catch (error) {
            console.error('Lookup error:', error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to retrieve booking',
                color: 'red',
            });
            setBooking(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'yellow',
            confirmed: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'gray';
    };

    const getPaymentColor = (status) => {
        const colors = {
            paid: 'green',
            pending: 'yellow',
            unpaid: 'red',
        };
        return colors[status] || 'gray';
    };

    return (
        <div className="min-h-screen bg-theme-bg pt-32 pb-20">
            <Container size="md">
                <Stack gap="xl">
                    {/* Header */}
                    <div className="text-center">
                        <Text size="xs" fw={900} tt="uppercase" c="nordic-gold-500" mb="xs">Guest Services</Text>
                        <h1 className="text-4xl md:text-5xl font-serif text-theme-text font-bold mb-4">
                            Retrieve Your Booking
                        </h1>
                        <Text c="dimmed" size="lg">
                            Enter your booking details to view your reservation
                        </Text>
                    </div>

                    {/* Lookup Form */}
                    <Paper shadow="xl" p="xl" radius="md" className="bg-theme-surface border border-theme-border">
                        <Stack gap="md">
                            <TextInput
                                label="Booking ID"
                                placeholder="Enter your booking reference (e.g., abc123-def456...)"
                                leftSection={<IconSearch size={16} />}
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value)}
                                size="lg"
                                required
                            />
                            <TextInput
                                label="Email Address"
                                placeholder="Enter the email used for booking"
                                leftSection={<IconMail size={16} />}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size="lg"
                                required
                            />
                            <Button
                                size="lg"
                                fullWidth
                                onClick={handleLookup}
                                loading={loading}
                                className="bg-nordic-gold-500 hover:bg-nordic-gold-600 text-nordic-dark-900 font-bold"
                            >
                                Find My Booking
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Booking Details */}
                    {booking && (
                        <Card shadow="xl" padding="xl" radius="md" className="bg-theme-surface border border-theme-border">
                            <Stack gap="lg">
                                <Group justify="apart">
                                    <div>
                                        <Text size="xs" c="dimmed" tt="uppercase">Booking Reference</Text>
                                        <Text size="xl" fw={700} className="font-mono">{booking.id}</Text>
                                    </div>
                                    <Group>
                                        <Badge size="lg" color={getStatusColor(booking.status)} variant="filled">
                                            {booking.status?.toUpperCase()}
                                        </Badge>
                                        <Badge size="lg" color={getPaymentColor(booking.payment_status)} variant="light">
                                            {booking.payment_status?.toUpperCase()}
                                        </Badge>
                                    </Group>
                                </Group>

                                <Divider />

                                {/* Unit Details */}
                                <div>
                                    <Group gap="xs" mb="xs">
                                        <IconHome size={20} className="text-nordic-gold-500" />
                                        <Text fw={700} size="lg">Accommodation Details</Text>
                                    </Group>
                                    <Stack gap="xs">
                                        <Group justify="apart">
                                            <Text c="dimmed">Unit</Text>
                                            <Text fw={600}>Unit {booking.unit_id}</Text>
                                        </Group>
                                        <Group justify="apart">
                                            <Text c="dimmed">Floor</Text>
                                            <Text fw={600}>Floor {Math.floor(booking.unit_id / 100)}</Text>
                                        </Group>
                                        {booking.view_type && (
                                            <Group justify="apart">
                                                <Text c="dimmed">View</Text>
                                                <Text fw={600} tt="capitalize">{booking.view_type} View</Text>
                                            </Group>
                                        )}
                                    </Stack>
                                </div>

                                <Divider />

                                {/* Stay Details */}
                                <div>
                                    <Group gap="xs" mb="xs">
                                        <IconCalendar size={20} className="text-nordic-gold-500" />
                                        <Text fw={700} size="lg">Stay Details</Text>
                                    </Group>
                                    <Stack gap="xs">
                                        <Group justify="apart">
                                            <Text c="dimmed">Check-in</Text>
                                            <Text fw={600}>{new Date(booking.check_in).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}</Text>
                                        </Group>
                                        <Group justify="apart">
                                            <Text c="dimmed">Check-out</Text>
                                            <Text fw={600}>{new Date(booking.check_out).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}</Text>
                                        </Group>
                                        <Group justify="apart">
                                            <Text c="dimmed">Duration</Text>
                                            <Text fw={600}>
                                                {Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24))} nights
                                            </Text>
                                        </Group>
                                    </Stack>
                                </div>

                                <Divider />

                                {/* Payment Details */}
                                <div>
                                    <Group gap="xs" mb="xs">
                                        <IconCurrencyDollar size={20} className="text-nordic-gold-500" />
                                        <Text fw={700} size="lg">Payment Information</Text>
                                    </Group>
                                    <Group justify="apart" align="center">
                                        <Text c="dimmed">Total Amount</Text>
                                        <Text size="2xl" fw={900} className="text-nordic-gold-500">
                                            ${booking.total_price?.toLocaleString()}
                                        </Text>
                                    </Group>
                                </div>

                                {booking.status === 'confirmed' && (
                                    <Alert color="green" title="Booking Confirmed" icon={<IconCheck size={16} />}>
                                        Your reservation is confirmed. We look forward to welcoming you!
                                    </Alert>
                                )}

                                {booking.status === 'pending' && (
                                    <Alert color="yellow" title="Pending Confirmation" icon={<IconAlertCircle size={16} />}>
                                        Your booking is being processed. You will receive a confirmation email shortly.
                                    </Alert>
                                )}
                            </Stack>
                        </Card>
                    )}

                    {/* Help Text */}
                    <Paper p="md" className="bg-theme-surface/50 border border-theme-border">
                        <Text size="sm" c="dimmed" ta="center">
                            <strong>Need help?</strong> Contact our concierge team at{' '}
                            <a href="mailto:concierge@nordicsuites.com" className="text-nordic-gold-500 hover:underline">
                                concierge@nordicsuites.com
                            </a>
                        </Text>
                    </Paper>
                </Stack>
            </Container>
        </div>
    );
};

export default BookingLookupPage;
