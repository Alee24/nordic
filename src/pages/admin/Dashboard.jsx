import React, { useState, useEffect } from 'react';
import {
    AppShell, Burger, Group, Text, Avatar, UnstyledButton,
    NavLink, ScrollArea, Paper, Stack, Button, Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconCalendarEvent, IconBed, IconSettings, IconLogout,
    IconBell, IconCurrencyDollar, IconMessage
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import Bookings from './Bookings';
import Rooms from './Rooms';
import Settings from './Settings';
import PaymentSettingsPage from './PaymentSettingsPage';
import Messages from './Messages';
import useManagementStore from '../../store/useManagementStore';
import api from '../../services/api';

// Error Boundary
class DashboardErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <Paper p="xl" withBorder radius="md" style={{ background: '#fff5f5' }}>
                    <Stack align="center" gap="md">
                        <Text fw={900} size="xl" c="red">Something went wrong</Text>
                        <Text size="sm" ta="center">{this.state.error?.toString()}</Text>
                        <Button variant="light" color="red" onClick={() => this.setState({ hasError: false, error: null })}>
                            Try Again
                        </Button>
                    </Stack>
                </Paper>
            );
        }
        return this.props.children;
    }
}

const Dashboard = ({ onExit }) => {
    const { user, logout } = useManagementStore();
    const [opened, { toggle }] = useDisclosure();
    // Default to Bookings (Overview removed)
    const [active, setActive] = useState('Bookings');
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Fetch unread message count for the badge
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await api.get('/messages?status=unread');
                const msgs = res.data?.data || [];
                setUnreadMessages(Array.isArray(msgs) ? msgs.filter(m => m.status === 'unread').length : 0);
            } catch (_) { /* silent */ }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 60000); // refresh every 60s
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        await logout();
        onExit();
    };

    const links = [
        { icon: IconCalendarEvent, label: 'Bookings' },
        { icon: IconBed, label: 'Rooms' },
        {
            icon: IconMessage, label: 'Messages',
            badge: unreadMessages > 0 ? unreadMessages : null
        },
        { icon: IconCurrencyDollar, label: 'Payments' },
        { icon: IconSettings, label: 'Settings' },
    ];

    const renderContent = () => {
        switch (active) {
            case 'Bookings': return <Bookings />;
            case 'Rooms': return <Rooms />;
            case 'Messages': return <Messages onUnreadChange={setUnreadMessages} />;
            case 'Payments': return <PaymentSettingsPage />;
            case 'Settings': return <Settings />;
            default: return <Bookings />;
        }
    };

    return (
        <AppShell
            header={{ height: 70 }}
            navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
            styles={{ main: { background: '#f8fafc', minHeight: '100vh' } }}
        >
            {/* Header */}
            <AppShell.Header style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Group gap="xs">
                            <div style={{
                                width: 36, height: 36, background: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
                                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 900, fontSize: 18
                            }}>N</div>
                            <Text fw={900} size="xl" style={{ letterSpacing: '-0.5px' }}>
                                NORDEN<span style={{ color: '#2563eb' }}>SUITES</span>
                            </Text>
                        </Group>
                    </Group>
                    <Group>
                        <UnstyledButton style={{ position: 'relative', padding: 8, color: '#6b7280' }}>
                            <IconBell size={22} stroke={1.5} />
                            {unreadMessages > 0 && (
                                <span style={{
                                    position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                                    background: '#ef4444', borderRadius: '50%'
                                }} />
                            )}
                        </UnstyledButton>
                        <div style={{ height: 32, width: 1, background: '#e5e7eb', margin: '0 8px' }} />
                        <UnstyledButton style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 12px', borderRadius: 99 }}>
                            <Avatar radius="xl" size="md" color="blue">
                                {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
                            </Avatar>
                            <div className="hidden sm:block" style={{ textAlign: 'left' }}>
                                <Text size="sm" fw={600} style={{ lineHeight: 1 }}>{user?.name || 'Admin'}</Text>
                                <Text size="xs" c="dimmed" style={{ lineHeight: 1, marginTop: 2 }}>{user?.role || 'admin'}</Text>
                            </div>
                        </UnstyledButton>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* Sidebar */}
            <AppShell.Navbar p="md" style={{ borderRight: '1px solid #e5e7eb', background: '#fff' }}>
                <AppShell.Section grow component={ScrollArea}>
                    <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingLeft: 12 }}>
                        Main Menu
                    </Text>
                    {links.map((link) => (
                        <NavLink
                            key={link.label}
                            label={
                                <Group gap="xs" justify="space-between" wrap="nowrap">
                                    <span>{link.label}</span>
                                    {link.badge && (
                                        <Badge size="xs" color="red" variant="filled" circle>{link.badge}</Badge>
                                    )}
                                </Group>
                            }
                            leftSection={<link.icon size="1.2rem" stroke={1.5} />}
                            active={active === link.label}
                            onClick={() => setActive(link.label)}
                            variant="filled"
                            color="blue"
                            style={{ borderRadius: 8, marginBottom: 4, fontWeight: 500 }}
                        />
                    ))}
                </AppShell.Section>

                <AppShell.Section style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                    <NavLink
                        label="Log Out & Return"
                        leftSection={<IconLogout size="1.2rem" stroke={1.5} />}
                        onClick={handleLogout}
                        variant="subtle"
                        color="red"
                        style={{ borderRadius: 8, fontWeight: 500 }}
                    />
                    <Text size="xs" c="dimmed" ta="center" mt="md">
                        Developed by{' '}
                        <a href="https://kkdes.co.ke/" target="_blank" rel="noopener noreferrer"
                            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>KKDES</a>
                    </Text>
                </AppShell.Section>
            </AppShell.Navbar>

            {/* Main Content */}
            <AppShell.Main>
                <DashboardErrorBoundary>
                    {renderContent()}
                </DashboardErrorBoundary>
            </AppShell.Main>
        </AppShell>
    );
};

export default Dashboard;
