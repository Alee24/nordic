import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Paper, Title, Text, Stack, Group, Grid,
    Button, Card, Divider, Box, Radio, TextInput,
    Alert, Loader, Center, Image, Badge
} from '@mantine/core';
import {
    IconDeviceMobile, IconBrandPaypal, IconCreditCard,
    IconCheck, IconAlertCircle, IconArrowRight, IconLock,
    IconExternalLink
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../services/api';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking, room, property } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProviders, setLoadingProviders] = useState(true);

    // Which providers are enabled
    const [providers, setProviders] = useState({
        mpesa: false,
        paypal: false,
        pesapal: false,
    });

    useEffect(() => {
        if (!booking) { navigate('/booking-search'); return; }
        fetchProviders();
    }, [booking]);

    const fetchProviders = async () => {
        setLoadingProviders(true);
        try {
            // Load generic settings (M-Pesa / PayPal enabled flags)
            const [genRes, ppRes] = await Promise.all([
                api.get('/settings?category=payment'),
                api.get('/settings/pesapal').catch(() => ({ data: { data: { enabled: false } } })),
            ]);
            const rows = Array.isArray(genRes.data?.data) ? genRes.data.data : [];
            const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
            const active = {
                mpesa: map['MPESA_ENABLED'] === 'true',
                paypal: map['PAYPAL_ENABLED'] === 'true',
                pesapal: ppRes.data?.data?.enabled === true,
            };
            setProviders(active);
            // Auto-select first enabled provider
            const first = Object.keys(active).find(k => active[k]);
            if (first) setPaymentMethod(first);
        } catch {
            // Fallback: show all options so guest is never stuck
            setProviders({ mpesa: true, paypal: true, pesapal: true });
        } finally {
            setLoadingProviders(false);
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const bookingId = booking.booking_id || booking.id;
            const amount = booking.total_price;
            const guestName = `${booking.guest_first_name || ''} ${booking.guest_last_name || ''}`.trim() || booking.guest_name || 'Guest';
            const guestEmail = booking.guest_email || '';
            const guestPhone = booking.guest_phone || phoneNumber || '';

            if (paymentMethod === 'mpesa') {
                if (!phoneNumber) throw new Error('Phone number is required for M-Pesa');
                await api.post('/payment/mpesa', { booking_id: bookingId, amount, phone_number: phoneNumber });
                notifications.show({
                    title: 'STK Push Sent ✓',
                    message: 'Check your phone and enter your M-Pesa PIN to complete payment.',
                    color: 'green',
                    autoClose: 8000,
                });
                setTimeout(() => navigate('/my-booking'), 6000);

            } else if (paymentMethod === 'paypal') {
                const res = await api.post('/payment/paypal', { booking_id: bookingId, amount });
                const approveUrl = res.data?.data?.approveUrl;
                if (approveUrl) window.location.href = approveUrl;
                else throw new Error('PayPal did not return an approval URL.');

            } else if (paymentMethod === 'pesapal') {
                const res = await api.post('/payment/pesapal', {
                    booking_id: bookingId,
                    amount,
                    currency: 'KES',
                    guest_name: guestName,
                    guest_email: guestEmail,
                    guest_phone: guestPhone,
                });
                if (res.data?.success && res.data?.redirect_url) {
                    // Redirect to PesaPal hosted payment page
                    window.location.href = res.data.redirect_url;
                } else {
                    throw new Error(res.data?.message || 'PesaPal did not return a payment URL.');
                }
            } else {
                throw new Error('Please select a payment method.');
            }
        } catch (error) {
            notifications.show({
                title: 'Payment Failed',
                message: error.response?.data?.message || error.message,
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    const anyProvider = providers.mpesa || providers.paypal || providers.pesapal;

    return (
        <Box className="bg-theme-bg min-h-screen pt-24 pb-16">
            <Container size="md">
                <Title order={1} className="font-serif mb-8 text-center text-theme-text">
                    Complete Your Reservation
                </Title>

                <Grid gutter="xl">
                    {/* ── LEFT: Payment Selection ── */}
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Stack gap="md">
                            <Card shadow="sm" radius="md" p="xl" withBorder className="bg-theme-surface border-theme-border">
                                <Title order={3} className="mb-4">Select Payment Method</Title>

                                {loadingProviders ? (
                                    <Center py="xl"><Loader type="bars" size="sm" /></Center>
                                ) : !anyProvider ? (
                                    <Alert icon={<IconAlertCircle size={16} />} color="orange" radius="md">
                                        No payment methods are currently enabled. Please contact the hotel directly.
                                    </Alert>
                                ) : (
                                    <Radio.Group
                                        value={paymentMethod}
                                        onChange={setPaymentMethod}
                                        name="paymentMethod"
                                        label="Choose how you'd like to pay"
                                        required
                                    >
                                        <Stack gap="sm" mt="md">

                                            {/* PesaPal — Card / M-Pesa / Mobile Money */}
                                            {providers.pesapal && (
                                                <Paper
                                                    withBorder p="md" radius="md"
                                                    className={paymentMethod === 'pesapal' ? 'border-teal-500 bg-teal-50/5' : ''}
                                                    style={paymentMethod === 'pesapal' ? { borderColor: '#0d9488' } : {}}
                                                >
                                                    <Radio
                                                        value="pesapal"
                                                        label={
                                                            <Group gap="xs">
                                                                <IconCreditCard size={20} style={{ color: '#0d9488' }} />
                                                                <Box>
                                                                    <Text fw={700} size="sm">Card / M-Pesa / Mobile Money</Text>
                                                                    <Text size="xs" c="dimmed">Powered by PesaPal — Visa, Mastercard, M-Pesa, Airtel</Text>
                                                                </Box>
                                                                <Badge color="teal" size="xs" variant="light">RECOMMENDED</Badge>
                                                            </Group>
                                                        }
                                                    />
                                                    {paymentMethod === 'pesapal' && (
                                                        <Alert icon={<IconExternalLink size={14} />} color="teal" variant="light" radius="md" mt="md" p="sm">
                                                            <Text size="xs">
                                                                You will be redirected to the secure PesaPal payment page to complete your payment. All major cards and mobile money accepted.
                                                            </Text>
                                                        </Alert>
                                                    )}
                                                </Paper>
                                            )}

                                            {/* M-Pesa STK Push */}
                                            {providers.mpesa && (
                                                <Paper
                                                    withBorder p="md" radius="md"
                                                    className={paymentMethod === 'mpesa' ? 'border-green-500' : ''}
                                                >
                                                    <Radio
                                                        value="mpesa"
                                                        label={
                                                            <Group gap="xs">
                                                                <IconDeviceMobile size={20} className="text-green-600" />
                                                                <Box>
                                                                    <Text fw={700} size="sm">M-Pesa STK Push</Text>
                                                                    <Text size="xs" c="dimmed">Receive a push notification on your phone</Text>
                                                                </Box>
                                                            </Group>
                                                        }
                                                    />
                                                    {paymentMethod === 'mpesa' && (
                                                        <Box mt="md" pl="xl">
                                                            <TextInput
                                                                label="M-Pesa Phone Number"
                                                                placeholder="e.g. 0712345678"
                                                                value={phoneNumber}
                                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                                description="A payment request will be sent to this number"
                                                                radius="md"
                                                            />
                                                        </Box>
                                                    )}
                                                </Paper>
                                            )}

                                            {/* PayPal */}
                                            {providers.paypal && (
                                                <Paper
                                                    withBorder p="md" radius="md"
                                                    className={paymentMethod === 'paypal' ? 'border-blue-500' : ''}
                                                >
                                                    <Radio
                                                        value="paypal"
                                                        label={
                                                            <Group gap="xs">
                                                                <IconBrandPaypal size={20} className="text-blue-600" />
                                                                <Box>
                                                                    <Text fw={700} size="sm">PayPal</Text>
                                                                    <Text size="xs" c="dimmed">Pay with PayPal account or card</Text>
                                                                </Box>
                                                            </Group>
                                                        }
                                                    />
                                                </Paper>
                                            )}
                                        </Stack>
                                    </Radio.Group>
                                )}

                                {anyProvider && (
                                    <Box mt="xl">
                                        <Button
                                            fullWidth size="lg"
                                            loading={loading}
                                            onClick={handlePayment}
                                            disabled={!paymentMethod}
                                            leftSection={<IconLock size={18} />}
                                            style={{ background: '#d4af37', color: '#1a1a1a' }}
                                        >
                                            {`Pay ${new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(booking.total_price)} Securely`}
                                        </Button>
                                        <Text size="xs" c="dimmed" ta="center" mt="sm">
                                            🔒 Your payment information is encrypted and secure.
                                        </Text>
                                    </Box>
                                )}
                            </Card>
                        </Stack>
                    </Grid.Col>

                    {/* ── RIGHT: Booking Summary ── */}
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Card shadow="sm" radius="md" p="xl" withBorder className="bg-theme-surface border-theme-border" style={{ position: 'sticky', top: '6rem' }}>
                            <Title order={3} className="mb-4">Booking Summary</Title>
                            <Stack gap="md">
                                <Group wrap="nowrap" align="flex-start">
                                    <Image
                                        src={room?.photos?.[0]?.url || '/images/b13.jpg'}
                                        w={80} h={80} radius="sm"
                                        fallbackSrc="/images/b13.jpg"
                                    />
                                    <Box>
                                        <Text fw={700} size="sm">{property?.name || 'Norden Suites'}</Text>
                                        <Text size="xs" c="dimmed">{room?.name || 'Luxury Suite'}</Text>
                                        <Badge size="xs" color="yellow" mt={4}>{`${booking.nights || 1} Night${(booking.nights || 1) > 1 ? 's' : ''}`}</Badge>
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
                                    {booking.guests && (
                                        <Group justify="space-between">
                                            <Text size="sm" c="dimmed">Guests</Text>
                                            <Text size="sm" fw={600}>{booking.guests}</Text>
                                        </Group>
                                    )}
                                </Stack>

                                <Divider />

                                <Group justify="space-between">
                                    <Text fw={700}>Total Amount</Text>
                                    <Text fw={900} size="xl" style={{ color: '#d4af37' }}>
                                        {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(booking.total_price)}
                                    </Text>
                                </Group>
                                <Text size="xs" c="dimmed" ta="right">Inclusive of VAT</Text>

                                <Alert color="blue" icon={<IconAlertCircle size={16} />} p="sm" radius="md">
                                    <Text size="xs">Cancellation is free up to 24 hours before check-in.</Text>
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
