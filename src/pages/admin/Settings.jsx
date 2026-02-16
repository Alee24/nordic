import React from 'react';
import {
    Stack,
    Text,
    Group,
    Paper,
    TextInput,
    Switch,
    Button,
    Divider,
    Title,
    SimpleGrid,
    Select,
    ActionIcon,
    ColorInput,
    Box
} from '@mantine/core';
import {
    IconSettings,
    IconBell,
    IconLock,
    IconPalette,
    IconDatabase,
    IconWorld,
    IconMail,
    IconDeviceFloppy
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
            notifications.show({
                title: 'Error',
                message: result.error,
                color: 'red'
            });
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
                            <Button variant="light" color="blue" leftSection={<IconDatabase size={16} />}>
                                Export Database (Backup)
                            </Button>
                            <Button variant="light" color="red" leftSection={<IconLock size={16} />}>
                                Update API Credentials
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

export default Settings;
