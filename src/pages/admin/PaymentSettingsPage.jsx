import React, { useState, useEffect } from 'react';
import {
    Stack, Text, Group, Box, Paper, Button, TextInput, Switch,
    Accordion, Badge, ActionIcon, Alert, Loader, Center, Divider,
    PasswordInput, Tabs, ThemeIcon, SimpleGrid, Card
} from '@mantine/core';
import {
    IconBrandPaypal, IconDeviceMobile, IconShieldCheck,
    IconCheck, IconAlertCircle, IconRefresh, IconCurrencyDollar,
    IconSettings, IconInfoCircle, IconExternalLink
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../services/api';

// ── Helpers ────────────────────────────────────────────────────────────────
const SETTING_KEYS = {
    mpesa: ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_SHORTCODE', 'MPESA_PASSKEY', 'MPESA_ENV'],
    paypal: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_ENV'],
};

const LABELS = {
    MPESA_CONSUMER_KEY: 'Consumer Key',
    MPESA_CONSUMER_SECRET: 'Consumer Secret',
    MPESA_SHORTCODE: 'Shortcode (Till/Paybill)',
    MPESA_PASSKEY: 'Lipa na M-Pesa Passkey',
    MPESA_ENV: 'Environment (sandbox / production)',
    PAYPAL_CLIENT_ID: 'Client ID',
    PAYPAL_CLIENT_SECRET: 'Client Secret',
    PAYPAL_ENV: 'Environment (sandbox / live)',
};

const IS_SECRET = (key) => key.includes('SECRET') || key.includes('PASSKEY');

const PaymentSettingsPage = () => {
    const [saving, setSaving] = useState('');
    const [testing, setTesting] = useState('');
    const [settings, setSettings] = useState({});   // { KEY: value }
    const [enabled, setEnabled] = useState({ mpesa: false, paypal: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/settings?category=payment');
            const rows = Array.isArray(res.data?.data) ? res.data.data : [];
            const map = {};
            rows.forEach(r => { map[r.key] = r.value; });
            setSettings(map);
            setEnabled({
                mpesa: map['MPESA_ENABLED'] === 'true',
                paypal: map['PAYPAL_ENABLED'] === 'true',
            });
        } catch (err) {
            notifications.show({ title: 'Error', message: 'Failed to load payment settings', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const saveProvider = async (provider) => {
        const keys = SETTING_KEYS[provider];
        setSaving(provider);
        try {
            // Save each key via generic settings endpoint
            await Promise.all([
                ...keys.map(key =>
                    api.post('/settings', { key, value: settings[key] || '', category: 'payment' })
                ),
                // Save enabled flag
                api.post('/settings', { key: `${provider.toUpperCase()}_ENABLED`, value: String(enabled[provider]), category: 'payment' }),
            ]);
            notifications.show({
                title: `${provider === 'mpesa' ? 'M-Pesa' : 'PayPal'} Saved`,
                message: 'Payment gateway settings updated successfully.',
                color: 'green', icon: <IconCheck size={16} />
            });
        } catch (err) {
            notifications.show({ title: 'Save Failed', message: err.response?.data?.message || err.message, color: 'red' });
        } finally {
            setSaving('');
        }
    };

    const testConnection = async (provider) => {
        setTesting(provider);
        try {
            // For M-Pesa: attempt to get OAuth token
            if (provider === 'mpesa') {
                const res = await api.post('/payment/mpesa/test', {
                    consumer_key: settings['MPESA_CONSUMER_KEY'],
                    consumer_secret: settings['MPESA_CONSUMER_SECRET'],
                    env: settings['MPESA_ENV'] || 'sandbox',
                });
                if (res.data.success) {
                    notifications.show({ title: 'M-Pesa Connected ✓', message: 'OAuth token received successfully.', color: 'green' });
                } else throw new Error(res.data.message);
            }
            // For PayPal: attempt to get access token
            if (provider === 'paypal') {
                const res = await api.post('/payment/paypal/test', {
                    client_id: settings['PAYPAL_CLIENT_ID'],
                    client_secret: settings['PAYPAL_CLIENT_SECRET'],
                    env: settings['PAYPAL_ENV'] || 'sandbox',
                });
                if (res.data.success) {
                    notifications.show({ title: 'PayPal Connected ✓', message: 'Access token received successfully.', color: 'green' });
                } else throw new Error(res.data.message);
            }
        } catch (err) {
            notifications.show({ title: 'Connection Failed', message: err.response?.data?.message || err.message, color: 'red' });
        } finally {
            setTesting('');
        }
    };

    const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    if (loading) return <Center h={400}><Loader type="bars" /></Center>;

    return (
        <Stack gap="xl">
            {/* Header */}
            <Box>
                <Group gap="xs" mb={4}>
                    <IconCurrencyDollar size={28} color="#2563eb" />
                    <Text size="2xl" fw={900} style={{ letterSpacing: '-0.5px' }}>Payment Gateways</Text>
                </Group>
                <Text size="sm" c="dimmed">Configure M-Pesa and PayPal to accept payments from guests.</Text>
            </Box>

            <Alert icon={<IconShieldCheck size={16} />} color="blue" variant="light" radius="md">
                API keys are stored securely in your database. Use <strong>sandbox</strong> keys while testing, then switch to <strong>production</strong> when ready to go live.
            </Alert>

            {/* M-Pesa Section */}
            <Paper withBorder radius="lg" p="xl">
                <Group justify="space-between" mb="lg">
                    <Group gap="md">
                        <ThemeIcon size={48} radius="md" color="green" variant="light">
                            <IconDeviceMobile size={26} />
                        </ThemeIcon>
                        <Box>
                            <Text fw={800} size="lg">M-Pesa (Safaricom)</Text>
                            <Text fz="sm" c="dimmed">Daraja API — STK Push payments</Text>
                        </Box>
                    </Group>
                    <Group gap="md">
                        <Badge color={enabled.mpesa ? 'green' : 'gray'} variant="filled" size="lg">
                            {enabled.mpesa ? 'ENABLED' : 'DISABLED'}
                        </Badge>
                        <Switch
                            size="lg"
                            color="green"
                            checked={enabled.mpesa}
                            onChange={(e) => setEnabled(prev => ({ ...prev, mpesa: e.currentTarget.checked }))}
                        />
                    </Group>
                </Group>

                <Divider mb="lg" />

                <SimpleGrid cols={{ base: 1, sm: 2 }} gap="md" mb="lg">
                    {SETTING_KEYS.mpesa.map(key => (
                        IS_SECRET(key) ? (
                            <PasswordInput
                                key={key}
                                label={LABELS[key]}
                                placeholder={`Enter ${LABELS[key]}`}
                                value={settings[key] || ''}
                                onChange={(e) => set(key, e.target.value)}
                                radius="md"
                            />
                        ) : (
                            <TextInput
                                key={key}
                                label={LABELS[key]}
                                placeholder={key === 'MPESA_ENV' ? 'sandbox or production' : `Enter ${LABELS[key]}`}
                                value={settings[key] || ''}
                                onChange={(e) => set(key, e.target.value)}
                                radius="md"
                            />
                        )
                    ))}
                </SimpleGrid>

                <Alert icon={<IconInfoCircle size={14} />} color="green" variant="light" radius="md" mb="lg">
                    <Text fz="xs" fw={600}>Where to get M-Pesa credentials:</Text>
                    <Text fz="xs">Go to <a href="https://developer.safaricom.co.ke" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>developer.safaricom.co.ke</a> → Create App → Lipa Na M-Pesa Online</Text>
                </Alert>

                <Group justify="flex-end" gap="md">
                    <Button
                        variant="light" color="green"
                        leftSection={testing === 'mpesa' ? <Loader size={14} color="green" /> : <IconRefresh size={16} />}
                        loading={testing === 'mpesa'}
                        onClick={() => testConnection('mpesa')}
                        disabled={!settings['MPESA_CONSUMER_KEY'] || !settings['MPESA_CONSUMER_SECRET']}
                    >
                        Test Connection
                    </Button>
                    <Button
                        color="green"
                        leftSection={<IconCheck size={16} />}
                        loading={saving === 'mpesa'}
                        onClick={() => saveProvider('mpesa')}
                    >
                        Save M-Pesa Settings
                    </Button>
                </Group>
            </Paper>

            {/* PayPal Section */}
            <Paper withBorder radius="lg" p="xl">
                <Group justify="space-between" mb="lg">
                    <Group gap="md">
                        <ThemeIcon size={48} radius="md" color="blue" variant="light">
                            <IconBrandPaypal size={26} />
                        </ThemeIcon>
                        <Box>
                            <Text fw={800} size="lg">PayPal</Text>
                            <Text fz="sm" c="dimmed">PayPal REST API — international card payments</Text>
                        </Box>
                    </Group>
                    <Group gap="md">
                        <Badge color={enabled.paypal ? 'blue' : 'gray'} variant="filled" size="lg">
                            {enabled.paypal ? 'ENABLED' : 'DISABLED'}
                        </Badge>
                        <Switch
                            size="lg"
                            color="blue"
                            checked={enabled.paypal}
                            onChange={(e) => setEnabled(prev => ({ ...prev, paypal: e.currentTarget.checked }))}
                        />
                    </Group>
                </Group>

                <Divider mb="lg" />

                <SimpleGrid cols={{ base: 1, sm: 2 }} gap="md" mb="lg">
                    {SETTING_KEYS.paypal.map(key => (
                        IS_SECRET(key) ? (
                            <PasswordInput
                                key={key}
                                label={LABELS[key]}
                                placeholder={`Enter ${LABELS[key]}`}
                                value={settings[key] || ''}
                                onChange={(e) => set(key, e.target.value)}
                                radius="md"
                            />
                        ) : (
                            <TextInput
                                key={key}
                                label={LABELS[key]}
                                placeholder={key === 'PAYPAL_ENV' ? 'sandbox or live' : `Enter ${LABELS[key]}`}
                                value={settings[key] || ''}
                                onChange={(e) => set(key, e.target.value)}
                                radius="md"
                            />
                        )
                    ))}
                </SimpleGrid>

                <Alert icon={<IconInfoCircle size={14} />} color="blue" variant="light" radius="md" mb="lg">
                    <Text fz="xs" fw={600}>Where to get PayPal credentials:</Text>
                    <Text fz="xs">Go to <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>PayPal Developer Dashboard</a> → My Apps & Credentials → Create App</Text>
                </Alert>

                <Group justify="flex-end" gap="md">
                    <Button
                        variant="light" color="blue"
                        leftSection={testing === 'paypal' ? <Loader size={14} /> : <IconRefresh size={16} />}
                        loading={testing === 'paypal'}
                        onClick={() => testConnection('paypal')}
                        disabled={!settings['PAYPAL_CLIENT_ID'] || !settings['PAYPAL_CLIENT_SECRET']}
                    >
                        Test Connection
                    </Button>
                    <Button
                        color="blue"
                        leftSection={<IconCheck size={16} />}
                        loading={saving === 'paypal'}
                        onClick={() => saveProvider('paypal')}
                    >
                        Save PayPal Settings
                    </Button>
                </Group>
            </Paper>

            <Text fz="xs" c="dimmed" ta="center">
                Developed by | <a href="https://kkdes.co.ke/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>KKDES</a>
            </Text>
        </Stack>
    );
};

export default PaymentSettingsPage;
