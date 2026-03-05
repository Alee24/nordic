import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Box, Title, Text, Stack, Button, Loader, Center, ThemeIcon } from '@mantine/core';
import { IconCircleCheck, IconAlertTriangle, IconArrowRight, IconHome } from '@tabler/icons-react';
import api from '../services/api';

/**
 * PesaPal redirects guests to:
 *   /payment/pesapal/success?booking_id=123&OrderTrackingId=xxx&OrderMerchantReference=yyy
 * We verify the transaction status and show a confirmation.
 */
const PesapalSuccessPage = () => {
    const [params] = useSearchParams();
    const bookingId = params.get('booking_id');
    const trackingId = params.get('OrderTrackingId');

    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'pending' | 'failed'
    const [details, setDetails] = useState(null);

    useEffect(() => {
        if (trackingId) {
            verifyPayment();
        } else {
            setStatus('pending');
        }
    }, [trackingId]);

    const verifyPayment = async () => {
        try {
            const res = await api.get(`/payment/pesapal/status?orderTrackingId=${trackingId}`);
            const data = res.data?.data;
            setDetails(data);
            const desc = data?.payment_status_description?.toLowerCase();
            if (desc === 'completed') setStatus('success');
            else if (desc === 'failed' || desc === 'invalid') setStatus('failed');
            else setStatus('pending');
        } catch {
            setStatus('pending');
        }
    };

    const STATUS_CONFIG = {
        loading: {
            icon: <Loader type="bars" size="lg" />,
            color: 'blue',
            title: 'Verifying Payment…',
            msg: 'Please wait while we confirm your payment with PesaPal.',
        },
        success: {
            icon: <IconCircleCheck size={56} />,
            color: '#0d9488',
            title: 'Payment Successful! 🎉',
            msg: 'Your reservation at Norden Suites has been confirmed. A confirmation email will be sent to you shortly.',
        },
        pending: {
            icon: <IconCircleCheck size={56} style={{ opacity: 0.5 }} />,
            color: '#d4af37',
            title: 'Payment Received',
            msg: 'Your payment is being processed. Your booking is confirmed and you will receive an email once the payment clears.',
        },
        failed: {
            icon: <IconAlertTriangle size={56} />,
            color: '#ef4444',
            title: 'Payment Failed',
            msg: 'Your payment could not be completed. Please try again or contact us for assistance.',
        },
    };

    const cfg = STATUS_CONFIG[status];

    return (
        <Box className="bg-theme-bg min-h-screen pt-24 pb-16">
            <Container size="sm">
                <Center>
                    <Stack align="center" gap="xl" style={{ maxWidth: 500, width: '100%' }}>
                        {/* Icon */}
                        <Box style={{ color: cfg.color }}>
                            {cfg.icon}
                        </Box>

                        {/* Text */}
                        <Stack align="center" gap="sm">
                            <Title order={2} className="font-serif text-center text-theme-text">
                                {cfg.title}
                            </Title>
                            <Text c="dimmed" ta="center" size="sm" maw={400}>
                                {cfg.msg}
                            </Text>
                        </Stack>

                        {/* Details */}
                        {(bookingId || trackingId) && (
                            <Box
                                p="lg"
                                style={{
                                    background: 'rgba(212,175,55,0.05)',
                                    border: '1px solid rgba(212,175,55,0.2)',
                                    borderRadius: 12,
                                    width: '100%',
                                }}
                            >
                                <Stack gap="xs">
                                    {bookingId && (
                                        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text size="sm" c="dimmed">Booking Reference</Text>
                                            <Text size="sm" fw={700}>#{bookingId}</Text>
                                        </Box>
                                    )}
                                    {trackingId && (
                                        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text size="sm" c="dimmed">PesaPal Tracking ID</Text>
                                            <Text size="sm" fw={700} style={{ wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>
                                                {trackingId}
                                            </Text>
                                        </Box>
                                    )}
                                    {details?.amount && (
                                        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text size="sm" c="dimmed">Amount Paid</Text>
                                            <Text size="sm" fw={700} style={{ color: '#d4af37' }}>
                                                {details.currency} {Number(details.amount).toLocaleString()}
                                            </Text>
                                        </Box>
                                    )}
                                    {details?.payment_method && (
                                        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text size="sm" c="dimmed">Payment Method</Text>
                                            <Text size="sm" fw={700}>{details.payment_method}</Text>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Actions */}
                        <Stack gap="sm" style={{ width: '100%' }}>
                            <Button
                                component={Link}
                                to="/"
                                size="md"
                                fullWidth
                                leftSection={<IconHome size={16} />}
                                style={{ background: '#d4af37', color: '#1a1a1a', fontWeight: 700 }}
                            >
                                Back to Home
                            </Button>
                            {status === 'failed' && (
                                <Button
                                    component={Link}
                                    to="/suites"
                                    variant="light"
                                    size="md"
                                    fullWidth
                                    leftSection={<IconArrowRight size={16} />}
                                >
                                    View Residences
                                </Button>
                            )}
                        </Stack>

                        <Text size="xs" c="dimmed" ta="center">
                            Need help? Email us at{' '}
                            <a href="mailto:welcome@nordensuites.com" style={{ color: '#d4af37' }}>
                                welcome@nordensuites.com
                            </a>
                        </Text>
                    </Stack>
                </Center>
            </Container>
        </Box>
    );
};

export default PesapalSuccessPage;
