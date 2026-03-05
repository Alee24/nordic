import React, { useState, useEffect } from 'react';
import {
    Stack, Text, Group, Box, Paper, Button, TextInput, Switch,
    Badge, Alert, Loader, Center, Divider,
    PasswordInput, ThemeIcon, SimpleGrid, CopyButton, Tooltip, ActionIcon
} from '@mantine/core';
import {
    IconBrandPaypal, IconDeviceMobile, IconShieldCheck,
    IconCheck, IconAlertCircle, IconRefresh, IconCurrencyDollar,
    IconInfoCircle, IconWebhook, IconCopy, IconExternalLink,
    IconCreditCard, IconCircleCheck, IconAlertTriangle
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../services/api';

// ── Helpers ─────────────────────────────────────────────────────────────────
const MPESA_KEYS = ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_SHORTCODE', 'MPESA_PASSKEY', 'MPESA_ENV'];
const PAYPAL_KEYS = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_ENV'];

const LABELS = {
    MPESA_CONSUMER_KEY: 'Consumer Key',
    MPESA_CONSUMER_SECRET: 'Consumer Secret',
    MPESA_SHORTCODE: 'Shortcode (Till / Paybill)',
    MPESA_PASSKEY: 'Lipa na M-Pesa Passkey',
    MPESA_ENV: 'Environment',
    PAYPAL_CLIENT_ID: 'Client ID',
    PAYPAL_CLIENT_SECRET: 'Client Secret',
    PAYPAL_ENV: 'Environment',
};

const IS_SECRET = (key) => key.includes('SECRET') || key.includes('PASSKEY');

// ── Component ────────────────────────────────────────────────────────────────
const PaymentSettingsPage = () => {
    const [saving, setSaving] = useState('');
    const [testing, setTesting] = useState('');
    const [regIpn, setRegIpn] = useState(false);
    const [settings, setSettings] = useState({});
    const [enabled, setEnabled] = useState({ mpesa: false, paypal: false, pesapal: false });
    const [pesapal, setPesapal] = useState({ consumer_key: '', consumer_secret: '', env: 'sandbox', ipn_id: '', hasSecret: false });
    const [loading, setLoading] = useState(true);

    const siteUrl = typeof window !== 'undefined' ? window.location.origin.replace(':8124', ':8123') : 'https://nordensuites.com';
    const ipnUrl = `${siteUrl}/api/payment/pesapal/ipn`;

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [genResult, ppResult] = await Promise.allSettled([
                api.get('/settings?category=payment'),
                api.get('/settings/pesapal'),
            ]);

            // Generic settings (M-Pesa / PayPal)
            if (genResult.status === 'fulfilled') {
                const rows = Array.isArray(genResult.value.data?.data) ? genResult.value.data.data : [];
                const map = {};
                rows.forEach(r => { map[r.key] = r.value; });
                setSettings(map);
                setEnabled(prev => ({
                    ...prev,
                    mpesa: map['MPESA_ENABLED'] === 'true',
                    paypal: map['PAYPAL_ENABLED'] === 'true',
                }));
            } else {
                console.warn('Could not load general payment settings:', genResult.reason?.message);
            }

            // PesaPal dedicated endpoint
            if (ppResult.status === 'fulfilled' && ppResult.value.data?.success) {
                const d = ppResult.value.data.data;
                setPesapal(d);
                setEnabled(prev => ({ ...prev, pesapal: !!d.enabled }));
            } else {
                console.warn('Could not load PesaPal settings:', ppResult.reason?.message);
            }
        } catch (err) {
            console.error('loadAll error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── Generic save (M-Pesa / PayPal) ──────────────────────────────────────
    const saveProvider = async (provider) => {
        const keys = provider === 'mpesa' ? MPESA_KEYS : PAYPAL_KEYS;
        setSaving(provider);
        try {
            await Promise.all([
                ...keys.map(key =>
                    api.post('/settings', { key, value: settings[key] || '', category: 'payment' })
                ),
                api.post('/settings', { key: `${provider.toUpperCase()}_ENABLED`, value: String(enabled[provider]), category: 'payment' }),
            ]);
            notifications.show({ title: 'Saved ✓', message: `${provider === 'mpesa' ? 'M-Pesa' : 'PayPal'} settings updated.`, color: 'green', icon: <IconCheck size={16} /> });
        } catch (err) {
            notifications.show({ title: 'Save Failed', message: err.response?.data?.message || err.message, color: 'red' });
        } finally { setSaving(''); }
    };

    // ── PesaPal save ─────────────────────────────────────────────────────────
    const savePesapal = async () => {
        setSaving('pesapal');
        try {
            const payload = {
                consumer_key: pesapal.consumer_key,
                consumer_secret: (pesapal.consumer_secret && pesapal.consumer_secret !== '••••••••') ? pesapal.consumer_secret : undefined,
                env: pesapal.env,
                enabled: enabled.pesapal,
            };
            await api.post('/settings/pesapal', payload);
            notifications.show({ title: 'PesaPal Saved ✓', message: 'PesaPal credentials saved successfully.', color: 'teal', icon: <IconCheck size={16} /> });
            loadAll(); // refresh to show masked secret
        } catch (err) {
            notifications.show({ title: 'Save Failed', message: err.response?.data?.message || err.message, color: 'red' });
        } finally { setSaving(''); }
    };

    // ── Test connections ──────────────────────────────────────────────────────
    const testConnection = async (provider) => {
        setTesting(provider);
        try {
            if (provider === 'mpesa') {
                const res = await api.post('/payment/mpesa/test', {
                    consumer_key: settings['MPESA_CONSUMER_KEY'],
                    consumer_secret: settings['MPESA_CONSUMER_SECRET'],
                    env: settings['MPESA_ENV'] || 'sandbox',
                });
                if (res.data.success) notifications.show({ title: 'M-Pesa Connected ✓', message: 'OAuth token received.', color: 'green' });
                else throw new Error(res.data.message);
            } else if (provider === 'paypal') {
                const res = await api.post('/payment/paypal/test', {
                    client_id: settings['PAYPAL_CLIENT_ID'],
                    client_secret: settings['PAYPAL_CLIENT_SECRET'],
                    env: settings['PAYPAL_ENV'] || 'sandbox',
                });
                if (res.data.success) notifications.show({ title: 'PayPal Connected ✓', message: 'Access token received.', color: 'green' });
                else throw new Error(res.data.message);
            } else if (provider === 'pesapal') {
                const res = await api.post('/payment/pesapal/test', {
                    consumer_key: pesapal.consumer_key,
                    consumer_secret: pesapal.consumer_secret,
                    env: pesapal.env || 'sandbox',
                });
                if (res.data.success) notifications.show({ title: 'PesaPal Connected ✓', message: 'Auth token received successfully.', color: 'teal' });
                else throw new Error(res.data.message);
            }
        } catch (err) {
            notifications.show({ title: 'Connection Failed', message: err.response?.data?.message || err.message, color: 'red' });
        } finally { setTesting(''); }
    };

    // ── Register IPN ─────────────────────────────────────────────────────────
    const handleRegisterIpn = async () => {
        setRegIpn(true);
        try {
            const res = await api.post('/payment/pesapal/register-ipn');
            if (res.data.success) {
                notifications.show({
                    title: 'IPN Registered ✓',
                    message: `IPN URL registered. ID: ${res.data.ipn_id}`,
                    color: 'teal',
                    autoClose: 8000,
                });
                loadAll();
            } else throw new Error(res.data.message);
        } catch (err) {
            notifications.show({ title: 'IPN Registration Failed', message: err.response?.data?.message || err.message, color: 'red' });
        } finally { setRegIpn(false); }
    };

    const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));
    const setPP = (key, val) => setPesapal(prev => ({ ...prev, [key]: val }));

    if (loading) return <Center h={400}><Loader type="bars" /></Center>;

    return (
        <Stack gap="xl">
            {/* Header */}
            <Box>
                <Group gap="xs" mb={4}>
                    <IconCurrencyDollar size={28} color="#2563eb" />
                    <Text size="2xl" fw={900} style={{ letterSpacing: '-0.5px' }}>Payment Gateways</Text>
                </Group>
                <Text size="sm" c="dimmed">Configure payment providers to accept guest payments. Use sandbox keys while testing.</Text>
            </Box>

            <Alert icon={<IconShieldCheck size={16} />} color="blue" variant="light" radius="md">
                All API keys are stored securely in your database. Never share these credentials with anyone.
            </Alert>

            {/* ── PESAPAL ─────────────────────────────────────────────────── */}
            <Paper withBorder radius="lg" p="xl" style={{ borderColor: enabled.pesapal ? '#0d9488' : undefined }}>
                <Group justify="space-between" mb="lg">
                    <Group gap="md">
                        <ThemeIcon size={48} radius="md" color="teal" variant="light">
                            <IconCreditCard size={26} />
                        </ThemeIcon>
                        <Box>
                            <Group gap="xs">
                                <Text fw={800} size="lg">PesaPal</Text>
                                <Badge color="teal" size="sm" variant="light">RECOMMENDED</Badge>
                            </Group>
                            <Text fz="sm" c="dimmed">API v3 — Card, M-Pesa, Airtel Money & more via one gateway</Text>
                        </Box>
                    </Group>
                    <Group gap="md">
                        <Badge color={enabled.pesapal ? 'teal' : 'gray'} variant="filled" size="lg">
                            {enabled.pesapal ? 'ENABLED' : 'DISABLED'}
                        </Badge>
                        <Switch
                            size="lg"
                            color="teal"
                            checked={!!enabled.pesapal}
                            onChange={() => setEnabled(prev => ({ ...prev, pesapal: !prev.pesapal }))}
                        />
                    </Group>
                </Group>

                <Divider mb="lg" />

                <SimpleGrid cols={{ base: 1, sm: 2 }} gap="md" mb="lg">
                    <TextInput
                        label="Consumer Key"
                        placeholder="Enter PesaPal consumer key"
                        value={pesapal.consumer_key}
                        onChange={(e) => setPP('consumer_key', e.target.value)}
                        radius="md"
                    />
                    <PasswordInput
                        label="Consumer Secret"
                        placeholder={pesapal.hasSecret ? '••••••••  (saved)' : 'Enter PesaPal consumer secret'}
                        value={pesapal.consumer_secret}
                        onChange={(e) => setPP('consumer_secret', e.target.value)}
                        radius="md"
                    />
                    <TextInput
                        label="Environment"
                        placeholder="sandbox or live"
                        value={pesapal.env}
                        onChange={(e) => setPP('env', e.target.value)}
                        description="Use 'sandbox' for testing — 'live' for production"
                        radius="md"
                    />
                    <TextInput
                        label="IPN ID (auto-generated)"
                        placeholder="Register IPN to get this"
                        value={pesapal.ipn_id}
                        readOnly
                        radius="md"
                        rightSection={
                            pesapal.ipn_id ? (
                                <CopyButton value={pesapal.ipn_id} timeout={2000}>
                                    {({ copied, copy }) => (
                                        <Tooltip label={copied ? 'Copied!' : 'Copy'}>
                                            <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                                                <IconCopy size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            ) : null
                        }
                        description={pesapal.ipn_id ? '✓ IPN registered' : 'Click "Register IPN URL" after saving credentials'}
                        styles={{ input: { color: pesapal.ipn_id ? '#0d9488' : undefined } }}
                    />
                </SimpleGrid>

                {/* IPN URL display */}
                <Paper withBorder p="md" radius="md" mb="lg" style={{ background: 'rgba(13,148,136,0.04)', borderColor: 'rgba(13,148,136,0.2)' }}>
                    <Group gap="xs" mb={6}>
                        <IconWebhook size={16} color="#0d9488" />
                        <Text fz="xs" fw={700} c="teal">Your IPN Callback URL</Text>
                    </Group>
                    <Group gap="xs">
                        <Text fz="xs" style={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }} c="dimmed">
                            {ipnUrl}
                        </Text>
                        <CopyButton value={ipnUrl} timeout={2000}>
                            {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied!' : 'Copy URL'}>
                                    <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                                        <IconCopy size={14} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </CopyButton>
                    </Group>
                    <Text fz="xs" c="dimmed" mt={4}>
                        This URL is automatically registered with PesaPal when you click "Register IPN URL" below. It must be publicly accessible.
                    </Text>
                </Paper>

                <Alert icon={<IconInfoCircle size={14} />} color="teal" variant="light" radius="md" mb="lg">
                    <Text fz="xs" fw={600}>How to get PesaPal credentials:</Text>
                    <Text fz="xs">
                        1. Register a merchant account at{' '}
                        <a href="https://www.pesapal.com/dashboard/account/register" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488' }}>pesapal.com</a>
                        {' '}→ your consumer_key & consumer_secret will be emailed to you.{'\n'}
                        2. For sandbox testing, get demo keys at{' '}
                        <a href="https://developer.pesapal.com/api3-demo-keys.txt" target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488' }}>developer.pesapal.com</a>
                    </Text>
                </Alert>

                {!pesapal.ipn_id && (
                    <Alert icon={<IconAlertTriangle size={14} />} color="orange" variant="light" radius="md" mb="lg">
                        <Text fz="xs" fw={600}>IPN Not Yet Registered</Text>
                        <Text fz="xs">Save your credentials first, then click "Register IPN URL". The IPN ID is required before any payment can be processed.</Text>
                    </Alert>
                )}

                {pesapal.ipn_id && (
                    <Alert icon={<IconCircleCheck size={14} />} color="teal" variant="light" radius="md" mb="lg">
                        <Text fz="xs" fw={600}>IPN Registered ✓</Text>
                        <Text fz="xs">PesaPal will send payment notifications to your server automatically. IPN ID: <code>{pesapal.ipn_id}</code></Text>
                    </Alert>
                )}

                <Group justify="flex-end" gap="md" wrap="wrap">
                    <Button
                        variant="light" color="teal"
                        leftSection={testing === 'pesapal' ? <Loader size={14} color="teal" /> : <IconRefresh size={16} />}
                        loading={testing === 'pesapal'}
                        onClick={() => testConnection('pesapal')}
                        disabled={!pesapal.consumer_key || !pesapal.consumer_secret}
                    >
                        Test Connection
                    </Button>
                    <Button
                        variant="light" color="orange"
                        leftSection={regIpn ? <Loader size={14} /> : <IconWebhook size={16} />}
                        loading={regIpn}
                        onClick={handleRegisterIpn}
                        disabled={!pesapal.consumer_key || !(pesapal.consumer_secret || pesapal.hasSecret)}
                    >
                        Register IPN URL
                    </Button>
                    <Button
                        color="teal"
                        leftSection={<IconCheck size={16} />}
                        loading={saving === 'pesapal'}
                        onClick={savePesapal}
                    >
                        Save PesaPal Settings
                    </Button>
                </Group>
            </Paper>

            {/* ── M-PESA ───────────────────────────────────────────────────── */}
            <Paper withBorder radius="lg" p="xl">
                <Group justify="space-between" mb="lg">
                    <Group gap="md">
                        <ThemeIcon size={48} radius="md" color="green" variant="light">
                            <IconDeviceMobile size={26} />
                        </ThemeIcon>
                        <Box>
                            <Text fw={800} size="lg">M-Pesa (Safaricom Daraja)</Text>
                            <Text fz="sm" c="dimmed">Daraja API — STK Push for direct M-Pesa payments</Text>
                        </Box>
                    </Group>
                    <Group gap="md">
                        <Badge color={enabled.mpesa ? 'green' : 'gray'} variant="filled" size="lg">
                            {enabled.mpesa ? 'ENABLED' : 'DISABLED'}
                        </Badge>
                        <Switch
                            size="lg" color="green"
                            checked={!!enabled.mpesa}
                            onChange={() => setEnabled(prev => ({ ...prev, mpesa: !prev.mpesa }))}
                        />
                    </Group>
                </Group>
                <Divider mb="lg" />
                <SimpleGrid cols={{ base: 1, sm: 2 }} gap="md" mb="lg">
                    {MPESA_KEYS.map(key => (
                        IS_SECRET(key) ? (
                            <PasswordInput key={key} label={LABELS[key]} placeholder={`Enter ${LABELS[key]}`}
                                value={settings[key] || ''} onChange={(e) => set(key, e.target.value)} radius="md" />
                        ) : (
                            <TextInput key={key} label={LABELS[key]}
                                placeholder={key === 'MPESA_ENV' ? 'sandbox or production' : `Enter ${LABELS[key]}`}
                                value={settings[key] || ''} onChange={(e) => set(key, e.target.value)} radius="md" />
                        )
                    ))}
                </SimpleGrid>
                <Alert icon={<IconInfoCircle size={14} />} color="green" variant="light" radius="md" mb="lg">
                    <Text fz="xs" fw={600}>Where to get M-Pesa credentials:</Text>
                    <Text fz="xs">Go to <a href="https://developer.safaricom.co.ke" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>developer.safaricom.co.ke</a> → Create App → Lipa Na M-Pesa Online</Text>
                </Alert>
                <Group justify="flex-end" gap="md">
                    <Button variant="light" color="green"
                        leftSection={testing === 'mpesa' ? <Loader size={14} color="green" /> : <IconRefresh size={16} />}
                        loading={testing === 'mpesa'} onClick={() => testConnection('mpesa')}
                        disabled={!settings['MPESA_CONSUMER_KEY'] || !settings['MPESA_CONSUMER_SECRET']}>
                        Test Connection
                    </Button>
                    <Button color="green" leftSection={<IconCheck size={16} />}
                        loading={saving === 'mpesa'} onClick={() => saveProvider('mpesa')}>
                        Save M-Pesa Settings
                    </Button>
                </Group>
            </Paper>

            {/* ── PAYPAL ───────────────────────────────────────────────────── */}
            <Paper withBorder radius="lg" p="xl">
                <Group justify="space-between" mb="lg">
                    <Group gap="md">
                        <ThemeIcon size={48} radius="md" color="blue" variant="light">
                            <IconBrandPaypal size={26} />
                        </ThemeIcon>
                        <Box>
                            <Text fw={800} size="lg">PayPal</Text>
                            <Text fz="sm" c="dimmed">PayPal REST API — international card & wallet payments</Text>
                        </Box>
                    </Group>
                    <Group gap="md">
                        <Badge color={enabled.paypal ? 'blue' : 'gray'} variant="filled" size="lg">
                            {enabled.paypal ? 'ENABLED' : 'DISABLED'}
                        </Badge>
                        <Switch size="lg" color="blue"
                            checked={!!enabled.paypal}
                            onChange={() => setEnabled(prev => ({ ...prev, paypal: !prev.paypal }))}
                        />
                    </Group>
                </Group>
                <Divider mb="lg" />
                <SimpleGrid cols={{ base: 1, sm: 2 }} gap="md" mb="lg">
                    {PAYPAL_KEYS.map(key => (
                        IS_SECRET(key) ? (
                            <PasswordInput key={key} label={LABELS[key]} placeholder={`Enter ${LABELS[key]}`}
                                value={settings[key] || ''} onChange={(e) => set(key, e.target.value)} radius="md" />
                        ) : (
                            <TextInput key={key} label={LABELS[key]}
                                placeholder={key === 'PAYPAL_ENV' ? 'sandbox or live' : `Enter ${LABELS[key]}`}
                                value={settings[key] || ''} onChange={(e) => set(key, e.target.value)} radius="md" />
                        )
                    ))}
                </SimpleGrid>
                <Alert icon={<IconInfoCircle size={14} />} color="blue" variant="light" radius="md" mb="lg">
                    <Text fz="xs" fw={600}>Where to get PayPal credentials:</Text>
                    <Text fz="xs">Go to <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>PayPal Developer Dashboard</a> → My Apps & Credentials → Create App</Text>
                </Alert>
                <Group justify="flex-end" gap="md">
                    <Button variant="light" color="blue"
                        leftSection={testing === 'paypal' ? <Loader size={14} /> : <IconRefresh size={16} />}
                        loading={testing === 'paypal'} onClick={() => testConnection('paypal')}
                        disabled={!settings['PAYPAL_CLIENT_ID'] || !settings['PAYPAL_CLIENT_SECRET']}>
                        Test Connection
                    </Button>
                    <Button color="blue" leftSection={<IconCheck size={16} />}
                        loading={saving === 'paypal'} onClick={() => saveProvider('paypal')}>
                        Save PayPal Settings
                    </Button>
                </Group>
            </Paper>

            <Text fz="xs" c="dimmed" ta="center">
                Developed by |{' '}
                <a href="https://kkdes.co.ke/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>KKDES</a>
            </Text>
        </Stack>
    );
};

export default PaymentSettingsPage;
