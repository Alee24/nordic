import React, { useEffect, useState } from 'react';
import {
    Container, Paper, Title, Text, Stack, Group, Switch,
    TextInput, Button, Accordion, Badge, ActionIcon,
    Alert, Loader, Center, Divider, Box
} from '@mantine/core';
import {
    IconSettings, IconCreditCard, IconBrandPaypal,
    IconDeviceMobile, IconLock, IconShieldCheck,
    IconAlertCircle, IconCheck, IconEye, IconEyeOff
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const PaymentSettingsPage = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [showKeys, setShowKeys] = useState({});

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/payment-settings.php`);
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to load payment settings',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdate = async (provider, providerData) => {
        setSaving(provider);
        try {
            const response = await axios.post(`${API_BASE}/payment-settings.php/${provider}`, providerData);
            if (response.data.success) {
                notifications.show({
                    title: 'Success',
                    message: `${provider.toUpperCase()} settings updated`,
                    color: 'green',
                    icon: <IconCheck size={18} />
                });
                fetchSettings();
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: `Failed to update ${provider} settings`,
                color: 'red'
            });
        } finally {
            setSaving(null);
        }
    };

    const toggleKeyVisibility = (provider, key) => {
        setShowKeys(prev => ({
            ...prev,
            [`${provider}_${key}`]: !prev[`${provider}_${key}`]
        }));
    };

    const getProviderIcon = (name) => {
        switch (name) {
            case 'mpesa': return <IconDeviceMobile size={24} className="text-green-600" />;
            case 'paypal': return <IconBrandPaypal size={24} className="text-blue-600" />;
            case 'stripe': return <IconCreditCard size={24} className="text-indigo-600" />;
            default: return <IconSettings size={24} />;
        }
    };

    if (loading) {
        return (
            <Center h="400px">
                <Loader size="xl" color="gold" />
            </Center>
        );
    }

    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                <Box>
                    <Title order={1} className="font-serif">Payment Gateway Settings</Title>
                    <Text c="dimmed">Configure and manage your payment providers for live and test environments.</Text>
                </Box>

                <Alert icon={<IconShieldCheck size={16} />} title="Security Note" color="blue" variant="light">
                    Your API keys are stored securely. Ensure you only use production keys when switching off Test Mode.
                </Alert>

                <Accordion variant="separated">
                    {settings.map((provider) => (
                        <Accordion.Item key={provider.provider_name} value={provider.provider_name}>
                            <Accordion.Control icon={getProviderIcon(provider.provider_name)}>
                                <Group justify="space-between" wrap="nowrap" style={{ width: '100%', paddingRight: '1rem' }}>
                                    <Stack gap={0}>
                                        <Text fw={700} tt="uppercase">{provider.provider_name}</Text>
                                        <Text size="xs" c="dimmed">
                                            {provider.is_active ? 'Currently active on checkout' : 'Inactive'}
                                        </Text>
                                    </Stack>
                                    <Group>
                                        {provider.test_mode && <Badge color="yellow" variant="light">Test Mode</Badge>}
                                        <Badge color={provider.is_active ? 'green' : 'gray'}>
                                            {provider.is_active ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </Group>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Paper p="md">
                                    <Stack gap="md">
                                        <Group>
                                            <Switch
                                                label="Enable Provider"
                                                checked={provider.is_active}
                                                onChange={(e) => {
                                                    const updated = { ...provider, is_active: e.currentTarget.checked };
                                                    handleUpdate(provider.provider_name, updated);
                                                }}
                                            />
                                            <Switch
                                                label="Test Mode (Sandbox)"
                                                checked={provider.test_mode}
                                                onChange={(e) => {
                                                    const updated = { ...provider, test_mode: e.currentTarget.checked };
                                                    handleUpdate(provider.provider_name, updated);
                                                }}
                                            />
                                        </Group>

                                        <Divider label="API Credentials" labelPosition="center" />

                                        <Stack gap="sm">
                                            {Object.keys(provider.credentials).map((key) => (
                                                <TextInput
                                                    key={key}
                                                    label={key.replace(/_/g, ' ').toUpperCase()}
                                                    value={provider.credentials[key]}
                                                    type={showKeys[`${provider.provider_name}_${key}`] ? 'text' : 'password'}
                                                    rightSection={
                                                        <ActionIcon
                                                            variant="subtle"
                                                            onClick={() => toggleKeyVisibility(provider.provider_name, key)}
                                                        >
                                                            {showKeys[`${provider.provider_name}_${key}`] ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                                        </ActionIcon>
                                                    }
                                                    onChange={(e) => {
                                                        const newCreds = { ...provider.credentials, [key]: e.target.value };
                                                        const newSettings = settings.map(p => p.provider_name === provider.provider_name ? { ...p, credentials: newCreds } : p);
                                                        setSettings(newSettings);
                                                    }}
                                                />
                                            ))}
                                        </Stack>

                                        <Group justify="flex-end" mt="md">
                                            <Button
                                                loading={saving === provider.provider_name}
                                                onClick={() => handleUpdate(provider.provider_name, provider)}
                                                className="bg-norden-gold-500 hover:bg-norden-gold-400"
                                            >
                                                Save Changes
                                            </Button>
                                        </Group>
                                    </Stack>
                                </Paper>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Stack>
        </Container>
    );
};

export default PaymentSettingsPage;
