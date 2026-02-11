import React, { useState } from 'react';
import { Stack, Title, Text, Button, Group, Box, TextInput, SegmentedControl, Alert, Loader } from '@mantine/core';
import { IconLock, IconDeviceMobile, IconCreditCard, IconCheck } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import PaymentService from '../../services/PaymentService';
import InvoiceService from '../../services/InvoiceService';
import useBookingStore from '../../store/useBookingStore';

const PaymentScreen = ({ bookingData, onComplete }) => {
    const [method, setMethod] = useState('mpesa');
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const { updatePaymentStatus } = useBookingStore();

    const handlePayment = async () => {
        setLoading(true);
        let result;

        if (method === 'mpesa') {
            result = await PaymentService.triggerMpesaPush(bookingData.total_price, '2547XXXXXXXX');
        } else {
            result = await PaymentService.processCardPayment({});
        }

        if (result.success) {
            await updatePaymentStatus('paid');
            setCompleted(true);
            // Generate Invoice
            await InvoiceService.generateInvoice({
                ...bookingData,
                guest_name: bookingData.guest_name,
                guest_email: bookingData.guest_email,
                suite_title: bookingData.suite.title,
            });
            setTimeout(() => onComplete(), 3000);
        }
        setLoading(false);
    };

    return (
        <AnimatePresence mode="wait">
            {completed ? (
                <motion.div
                    key="completed"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                >
                    <Box className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <IconCheck size={40} className="text-green-500" />
                    </Box>
                    <Title order={2} className="italic mb-2">Payment Secured</Title>
                    <Text className="text-nordic-frost/60 mb-6">Your receipt has been generated and your stay is confirmed.</Text>
                    <Loader color="gold" size="sm" />
                </motion.div>
            ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Stack gap="xl">
                        <Alert color="gold" icon={<IconLock size={16} />} variant="light">
                            <Text size="xs" fw={500}>REINFORCED SECURITY: Your transaction is protected by 256-bit TLS encryption.</Text>
                        </Alert>

                        <Box>
                            <Text size="xs" tt="uppercase" lts={2} fw={700} className="text-nordic-gold mb-3">Preferred Method</Text>
                            <SegmentedControl
                                value={method}
                                onChange={setMethod}
                                fullWidth
                                size="lg"
                                color="gold"
                                data={[
                                    { label: <Group gap="xs"><IconDeviceMobile size={18} /> M-Pesa</Group>, value: 'mpesa' },
                                    { label: <Group gap="xs"><IconCreditCard size={18} /> Visa / Card</Group>, value: 'card' },
                                ]}
                                styles={{
                                    root: { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                                }}
                            />
                        </Box>

                        {method === 'mpesa' ? (
                            <Stack gap="sm">
                                <TextInput
                                    placeholder="M-Pesa Number (e.g. 07XXXXXXXX)"
                                    label="Phone Number"
                                    size="lg"
                                    variant="filled"
                                    styles={{ input: { backgroundColor: 'rgba(255,255,255,0.05)' } }}
                                />
                                <Text size="xs" opacity={0.5} className="italic">An STK Push will be sent to your device.</Text>
                            </Stack>
                        ) : (
                            <Stack gap="sm">
                                <TextInput
                                    placeholder="0000 0000 0000 0000"
                                    label="Card Number"
                                    size="lg"
                                    variant="filled"
                                    styles={{ input: { backgroundColor: 'rgba(255,255,255,0.05)' } }}
                                />
                                <Group grow>
                                    <TextInput placeholder="MM/YY" label="Expiry" variant="filled" styles={{ input: { backgroundColor: 'rgba(255,255,255,0.05)' } }} />
                                    <TextInput placeholder="CVC" label="CVC" variant="filled" styles={{ input: { backgroundColor: 'rgba(255,255,255,0.05)' } }} />
                                </Group>
                            </Stack>
                        )}

                        <Button
                            size="xl"
                            color="gold"
                            className="font-bold tracking-widest mt-4"
                            onClick={handlePayment}
                            loading={loading}
                        >
                            PAY ${(bookingData.total_price * 1.16).toFixed(2)}
                        </Button>
                    </Stack>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PaymentScreen;
