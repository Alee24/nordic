import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Paper, Title, Text, Stack, Group, Grid,
    Button, Card, Divider, Box, Radio, TextInput,
    Alert, Loader, Center, Image, Badge
} from '@mantine/core';
import {
    IconDeviceMobile, IconBrandPaypal, IconCreditCard,
    IconCheck, IconAlertCircle, IconArrowRight, IconLock
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8569/backend/api';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking, room, property } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState([]);

    useEffect(() => {
        if (!booking) {
            navigate('/booking-search');
            return;
        }
        fetchAvailableProviders();
    }, [booking]);

    const fetchAvailableProviders = async () => {
        try {
            const response = await axios.get(`${API_BASE}/payment-settings.php`);
            if (response.data.success) {
                setProviders(response.data.data.filter(p => p.is_active));
            }
        } catch (error) {
            console.error('Failed to fetch providers');
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const data = {
                booking_id: booking.booking_id || booking.id,
                amount: booking.total_price,
            };

            let response;
            if (paymentMethod === 'mpesa') {
                if (!phoneNumber) throw new Error('Phone number is required for M-Pesa');
                response = await axios.post(`${API_BASE}/payment.php/mpesa`, { ...data, phone_number: phoneNumber });
                notifications.show({
                    title: 'STK Push Sent',
                    message: 'Please check your phone and enter your PIN',
                    color: 'green'
                });
                setTimeout(() => navigate('/my-booking'), 5000);
            } else if (paymentMethod === 'paypal') {
                response = await axios.post(`${API_BASE}/payment.php/paypal`, data);
                if (response.data.data.links) {
                    const approvalUrl = response.data.data.links.find(l => l.rel === 'approve').href;
                    window.location.href = approvalUrl;
                }
            } else if (paymentMethod === 'stripe') {
                response = await axios.post(`${API_BASE}/payment.php/stripe`, data);
                if (response.data.data.url) {
                    window.location.href = response.data.data.url;
                }
            }
        } catch (error) {
            notifications.show({
                title: 'Payment Failed',
                message: error.response?.data?.message || error.message,
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    return (
        <Box className="bg-theme-bg min-h-screen pt-24 pb-16">
            <Container size="md">
                <Title order={1} className="font-serif mb-8 text-center text-theme-text">Complete Your Reservation</Title>

                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Stack gap="md">
                            <Card shadow="sm" radius="md" p="xl" withBorder className="bg-theme-surface border-theme-border">
                                <Title order={3} className="mb-4">Select Payment Method</Title>

                                <Radio.Group
                                    value={paymentMethod}
                                    onChange={setPaymentMethod}
                                    name="paymentMethod"
                                    label="Choose how you'd like to pay"
                                    required
                                >
                                    <Stack gap="sm" mt="md">
                                        {providers.some(p => p.provider_name === 'mpesa') && (
                                            <Paper withBorder p="md" radius="sm" className={paymentMethod === 'mpesa' ? 'border-norden-gold-500 bg-norden-gold-50/5' : ''}>
                                                <Radio
                                                    value="mpesa"
                                                    label={
                                                        <Group gap="xs">
                                                            <IconDeviceMobile size={20} className="text-green-600" />
                                                            <Text fw={600}>M-Pesa STK Push</Text>
                                                        </Group>
                                                    }
                                                />
                                                {paymentMethod === 'mpesa' && (
                                                    <Box mt="md" pl="xl">
                                                        <TextInput
                                                            label="Phone Number"
                                                            placeholder="e.g. 0712345678"
                                                            value={phoneNumber}
                                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                                            description="We will send a payment request to this number"
                                                        />
                                                    </Box>
                                                )}
                                            </Paper>
                                        )}

                                        {providers.some(p => p.provider_name === 'paypal') && (
                                            <Paper withBorder p="md" radius="sm" className={paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50/5' : ''}>
                                                <Radio
                                                    value="paypal"
                                                    label={
                                                        <Group gap="xs">
                                                            <IconBrandPaypal size={20} className="text-blue-600" />
                                                            <Text fw={600}>PayPal / Credit Card</Text>
                                                        </Group>
                                                    }
                                                />
                                            </Paper>
                                        )}

                                        {providers.some(p => p.provider_name === 'stripe') && (
                                            <Paper withBorder p="md" radius="sm" className={paymentMethod === 'stripe' ? 'border-indigo-500 bg-indigo-50/5' : ''}>
                                                <Radio
                                                    value="stripe"
                                                    label={
                                                        <Group gap="xs">
                                                            <IconCreditCard size={20} className="text-indigo-600" />
                                                            <Text fw={600}>Visa / Mastercard (Stripe)</Text>
                                                        </Group>
                                                    }
                                                />
                                            </Paper>
                                        )}
                                    </Stack>
                                </Radio.Group>

                                <Box mt="xl">
                                    <Button
                                        fullWidth
                                        size="lg"
                                        color="gold"
                                        loading={loading}
                                        onClick={handlePayment}
                                        leftSection={<IconLock size={18} />}
                                        className="bg-norden-gold-500 hover:bg-norden-gold-400"
                                    >
                                        {`Pay $${booking.total_price.toLocaleString()} Securely`}
                                    </Button>
                                    <Text size="xs" c="dimmed" ta="center" mt="sm">
                                        Your payment information is encrypted and secure.
                                    </Text>
                                </Box>
                            </Card>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Card shadow="sm" radius="md" p="xl" withBorder className="bg-theme-surface border-theme-border sticky top-24">
                            <Title order={3} className="mb-4">Booking Summary</Title>

                            <Stack gap="md">
                                <Group wrap="nowrap" align="flex-start">
                                    <Image
                                        src={room?.photos?.[0]?.url || 'https://via.placeholder.com/100'}
                                        w={80}
                                        h={80}
                                        radius="sm"
                                    />
                                    <Box>
                                        <Text fw={700} size="sm">{property?.name || 'N Norden Suits'}</Text>
                                        <Text size="xs" c="dimmed">{room?.name || 'Executive Room'}</Text>
                                        <Badge size="xs" color="gold" mt={4}>{`${booking.nights || 0} Nights`}</Badge>
                                    </Box>
                                </Group>

                                <Divider />

                                <Stack gap="xs">
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Check-in</Text>
                                        <Text size="sm" fw={600}>{booking.check_in}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">Check-out</Text>
                                        <Text size="sm" fw={600}>{booking.check_out}</Text>
                                    </Group>
                                </Stack>

                                <Divider />

                                <Group justify="space-between">
                                    <Text fw={700}>Total Amount</Text>
                                    <Text fw={900} size="xl" className="text-norden-gold-500">
                                        {`$${booking.total_price.toLocaleString()}`}
                                    </Text>
                                </Group>

                                <Alert color="blue" icon={<IconAlertCircle size={16} />} p="sm">
                                    <Text size="xs">
                                        Cancellation is free up to 24 hours before check-in.
                                    </Text>
                                </Alert>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

export default CheckoutPage;
