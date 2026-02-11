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

const Settings = () => {
    const [demoMode, setDemoMode] = React.useState(true);
    const handleSave = () => {
        notifications.show({
            title: 'Settings Saved',
            message: 'Your property configurations have been updated successfully.',
            color: 'green',
            icon: <IconDeviceFloppy size={16} />
        });
    };

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Box>
                    <Text size="xl" fw={800}>System Settings</Text>
                    <Text size="sm" c="dimmed">Configure property details, notifications, and application preferences.</Text>
                </Box>
                <Group gap="sm">
                    <div className="flex bg-gray-100 p-1 rounded-lg opacity-80 cursor-not-allowed">
                        <button
                            disabled
                            className="px-3 py-1 text-xs font-bold rounded-md transition-all text-gray-400 bg-transparent"
                        >
                            LIVE
                        </button>
                        <button
                            disabled
                            className="px-3 py-1 text-xs font-bold rounded-md transition-all bg-white shadow text-blue-600"
                        >
                            DEMO
                        </button>
                    </div>
                    <Button size="md" radius="md" leftSection={<IconDeviceFloppy size={18} />} onClick={handleSave}>
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
                            <TextInput label="Property Name" defaultValue="Nordic Suites & Residences" />
                            <TextInput label="Contact Email" defaultValue="admin@nordic.com" />
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
