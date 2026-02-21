import React from 'react';
import {
    Stack,
    Text,
    Group,
    Paper,
    TextInput,
    PasswordInput,
    Switch,
    Button,
    Divider,
    Title,
    SimpleGrid,
    Select,
    ColorInput,
    Box,
    NumberInput,
    Badge,
    Loader,
} from '@mantine/core';
import {
    IconSettings,
    IconBell,
    IconLock,
    IconPalette,
    IconDatabase,
    IconWorld,
    IconMail,
    IconDeviceFloppy,
    IconSend,
    IconCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { dashboardService } from '../../services/dashboardService';

const Settings = () => {
    const [loading, setLoading] = React.useState(false);
    const [settings, setSettings] = React.useState([]);
    const [aviationKey, setAviationKey] = React.useState('');

    React.useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const result = await dashboardService.getSettings();
        if (result.success) {
            setSettings(result.data);
            const keySetting = result.data.find(s => s.setting_key === 'aviationstack_api_key');
            if (keySetting) setAviationKey(keySetting.setting_value);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setLoading(true);
        const result = await dashboardService.updateSetting('aviationstack_api_key', aviationKey, 'integrations');
        if (result.success) {
            notifications.show({
                title: 'Settings Saved',
                message: 'AviationStack configuration updated successfully.',
                color: 'green',
                icon: <IconDeviceFloppy size={16} />
            });
        } else {
            notifications.show({ title: 'Error', message: result.error, color: 'red' });
        }
        setLoading(false);
    };

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Box>
                    <Title order={2} fw={800}>System Settings</Title>
                    <Text size="sm" c="dimmed">Configure property details, notifications, and application preferences.</Text>
                </Box>
                <Group gap="sm">
                    <Button
                        size="md"
                        radius="md"
                        loading={loading}
                        leftSection={<IconDeviceFloppy size={18} />}
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </Group>
            </Group>

            {/* SMTP Settings — full width */}
            <SmtpSettingsPanel />

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                <Stack gap="lg">
                    <Paper withBorder p="xl" radius="md">
                        <Group mb="lg">
                            <IconSettings size={24} className="text-blue-600" />
                            <Title order={4}>General Info</Title>
                        </Group>
                        <Stack>
                            <TextInput label="Property Name" defaultValue="Norden Suites & Residences" />
                            <TextInput label="Contact Email" defaultValue="admin@nordensuites.com" />
                            <Select
                                label="Primary Currency"
                                defaultValue="USD"
                                data={['USD', 'EUR', 'GBP', 'KES']}
                            />
                            <TextInput label="Address" defaultValue="Nyali, Mombasa, Kenya" />
                        </Stack>
                    </Paper>

                    <Paper withBorder p="xl" radius="md">
                        <Group mb="lg">
                            <IconWorld size={24} className="text-blue-500" />
                            <Title order={4}>External Integrations</Title>
                        </Group>
                        <Stack>
                            <TextInput
                                label="AviationStack API Key"
                                description="Required for guest flight status features"
                                placeholder="Enter your API access key"
                                value={aviationKey}
                                onChange={(e) => setAviationKey(e.target.value)}
                                type="password"
                            />
                            <Text size="xs" c="dimmed">
                                Get your key at <a href="https://aviationstack.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">aviationstack.com</a>
                            </Text>
                        </Stack>
                    </Paper>

                    <Paper withBorder p="xl" radius="md">
                        <Group mb="lg">
                            <IconBell size={24} className="text-orange-600" />
                            <Title order={4}>Notifications</Title>
                        </Group>
                        <Stack>
                            <Switch label="Email alerts for new bookings" defaultChecked />
                            <Switch label="SMS notifications for arrivals" defaultChecked />
                            <Switch label="Maintenance alerts" defaultChecked />
                            <Switch label="Weekly performance reports" />
                        </Stack>
                    </Paper>
                </Stack>

                <Stack gap="lg">
                    <Paper withBorder p="xl" radius="md">
                        <Group mb="lg">
                            <IconPalette size={24} className="text-purple-600" />
                            <Title order={4}>Appearance</Title>
                        </Group>
                        <Stack>
                            <Select
                                label="Dashboard Theme"
                                defaultValue="system"
                                data={[
                                    { value: 'light', label: 'Light Mode' },
                                    { value: 'dark', label: 'Dark Mode' },
                                    { value: 'system', label: 'System Default' }
                                ]}
                            />
                            <ColorInput label="Brand Secondary Color" defaultValue="#1c7ed6" />
                            <Switch label="Compact layout" />
                        </Stack>
                    </Paper>

                    <Paper withBorder p="xl" radius="md">
                        <Group mb="lg">
                            <IconLock size={24} className="text-red-600" />
                            <Title order={4}>Security & Backups</Title>
                        </Group>
                        <Stack>
                            <Divider label="Change Password" labelPosition="center" />
                            <PasswordChangeForm />

                            <Button variant="light" color="blue" leftSection={<IconDatabase size={16} />}>
                                Export Database (Backup)
                            </Button>
                            <Divider label="Advanced" labelPosition="center" />
                            <Switch label="Enable 2FA for Staff" />
                            <Switch label="Audit logging" defaultChecked />
                        </Stack>
                    </Paper>
                </Stack>
            </SimpleGrid>
        </Stack>
    );
};

// ── SMTP Settings Panel ────────────────────────────────────────────────────────
const SmtpSettingsPanel = () => {
    const [loading, setLoading] = React.useState(false);
    const [testing, setTesting] = React.useState(false);
    const [testEmail, setTestEmail] = React.useState('');
    const [smtp, setSmtp] = React.useState({
        host: '',
        port: 587,
        user: '',
        pass: '',
        from: '',
    });

    React.useEffect(() => {
        loadSmtp();
    }, []);

    const loadSmtp = async () => {
        setLoading(true);
        const result = await dashboardService.getSmtpSettings();
        if (result.success && result.data) {
            setSmtp({
                host: result.data.host || '',
                port: result.data.port || 587,
                user: result.data.user || '',
                pass: result.data.pass || '',
                from: result.data.from || '',
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setLoading(true);
        const result = await dashboardService.saveSmtpSettings(smtp);
        if (result.success) {
            notifications.show({
                title: 'SMTP Saved',
                message: result.message || 'Email settings saved successfully.',
                color: 'green',
                icon: <IconCheck size={16} />,
            });
        } else {
            notifications.show({
                title: 'Save Failed',
                message: result.error,
                color: 'red',
            });
        }
        setLoading(false);
    };

    const handleTest = async () => {
        if (!testEmail) {
            notifications.show({ title: 'Required', message: 'Enter a recipient email address first.', color: 'orange' });
            return;
        }
        setTesting(true);
        const result = await dashboardService.testSmtpSettings(testEmail);
        if (result.success) {
            notifications.show({
                title: '✅ Test Email Sent',
                message: result.message,
                color: 'green',
                autoClose: 6000,
            });
        } else {
            notifications.show({
                title: '❌ SMTP Test Failed',
                message: result.error,
                color: 'red',
                autoClose: 10000,
            });
        }
        setTesting(false);
    };

    return (
        <Paper withBorder p="xl" radius="md">
            <Group mb="lg" justify="space-between">
                <Group>
                    <IconMail size={24} className="text-green-600" />
                    <Box>
                        <Title order={4}>Email / SMTP Settings</Title>
                        <Text size="xs" c="dimmed">Configure outbound email for booking confirmations and notifications</Text>
                    </Box>
                </Group>
                <Badge color="green" variant="light" size="sm">Required for booking emails</Badge>
            </Group>

            {loading ? (
                <Group justify="center" py="lg"><Loader size="sm" /></Group>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="SMTP Host"
                        placeholder="smtp.gmail.com"
                        description="e.g. smtp.gmail.com, mail.yourdomain.com"
                        value={smtp.host}
                        onChange={e => setSmtp(s => ({ ...s, host: e.target.value }))}
                    />
                    <NumberInput
                        label="SMTP Port"
                        placeholder="587"
                        description="587 (TLS) · 465 (SSL) · 25 (plain)"
                        value={smtp.port}
                        onChange={v => setSmtp(s => ({ ...s, port: v }))}
                        min={1}
                        max={65535}
                    />
                    <TextInput
                        label="Username / Email"
                        placeholder="your@email.com"
                        value={smtp.user}
                        onChange={e => setSmtp(s => ({ ...s, user: e.target.value }))}
                    />
                    <PasswordInput
                        label="Password / App Password"
                        placeholder="Enter SMTP password"
                        description="For Gmail: use an App Password, not your account password"
                        value={smtp.pass}
                        onChange={e => setSmtp(s => ({ ...s, pass: e.target.value }))}
                    />
                    <TextInput
                        label="From Name / Address"
                        placeholder="Norden Suites <info@nordensuites.com>"
                        description="Displayed as sender in guest inbox. Leave blank to use username."
                        value={smtp.from}
                        onChange={e => setSmtp(s => ({ ...s, from: e.target.value }))}
                    />
                </SimpleGrid>
            )}

            <Divider my="lg" label="Test Connection" labelPosition="center" />

            <Group align="flex-end" gap="sm" wrap="wrap">
                <TextInput
                    label="Send test email to"
                    placeholder="your@email.com"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    style={{ flex: 1, minWidth: 220 }}
                />
                <Button
                    leftSection={<IconSend size={16} />}
                    variant="light"
                    color="blue"
                    loading={testing}
                    onClick={handleTest}
                >
                    Send Test Email
                </Button>
                <Button
                    leftSection={<IconDeviceFloppy size={16} />}
                    loading={loading}
                    onClick={handleSave}
                    color="green"
                >
                    Save SMTP Settings
                </Button>
            </Group>
        </Paper>
    );
};

// ── Password Change Form ────────────────────────────────────────────────────────
const PasswordChangeForm = () => {
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
            notifications.show({ title: 'Validation Error', message: 'All fields are required', color: 'red' });
            return;
        }
        if (formData.new_password.length < 6) {
            notifications.show({ title: 'Validation Error', message: 'New password must be at least 6 characters long', color: 'red' });
            return;
        }
        if (formData.new_password !== formData.confirm_password) {
            notifications.show({ title: 'Validation Error', message: 'New passwords do not match', color: 'red' });
            return;
        }

        setLoading(true);
        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${API_BASE}/auth.php/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    current_password: formData.current_password,
                    new_password: formData.new_password
                })
            });
            const result = await response.json();
            if (result.success) {
                notifications.show({ title: 'Success', message: 'Password changed successfully', color: 'green' });
                setFormData({ current_password: '', new_password: '', confirm_password: '' });
            } else {
                notifications.show({ title: 'Error', message: result.message || 'Failed to change password', color: 'red' });
            }
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to change password. Please try again.', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack gap="md">
            <TextInput
                label="Current Password"
                placeholder="Enter current password"
                type="password"
                value={formData.current_password}
                onChange={(e) => handleChange('current_password', e.target.value)}
                required
            />
            <TextInput
                label="New Password"
                placeholder="Enter new password (min 6 characters)"
                type="password"
                value={formData.new_password}
                onChange={(e) => handleChange('new_password', e.target.value)}
                description="Password must be at least 6 characters long"
                required
            />
            <TextInput
                label="Confirm New Password"
                placeholder="Re-enter new password"
                type="password"
                value={formData.confirm_password}
                onChange={(e) => handleChange('confirm_password', e.target.value)}
                error={formData.confirm_password && formData.new_password !== formData.confirm_password ? 'Passwords do not match' : ''}
                required
            />
            <Button
                onClick={handleSubmit}
                loading={loading}
                leftSection={<IconLock size={16} />}
                color="blue"
            >
                Change Password
            </Button>
        </Stack>
    );
};

export default Settings;
