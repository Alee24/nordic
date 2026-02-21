import React, { useState, useEffect } from 'react';
import {
    AppShell,
    Burger,
    Group,
    Text,
    Avatar,
    UnstyledButton,
    rem,
    useMantineTheme,
    NavLink,
    LoadingOverlay,
    ScrollArea,
    Paper,
    Stack,
    Button
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconLayoutDashboard,
    IconCalendarEvent,
    IconUser,
    IconBed,
    IconSettings,
    IconLogout,
    IconBell,
    IconSearch,
    IconMenu2,
    IconDoorEnter,
    IconCurrencyDollar,
    IconPlaneDeparture,
    IconMessage
} from '@tabler/icons-react';

// Components (We will create these next)
import DashboardOverview from './components/DashboardOverview';
import Bookings from './Bookings';
import Rooms from './Rooms';
import Settings from './Settings';
import PaymentSettingsPage from './PaymentSettingsPage';
import Messages from './Messages';
import useManagementStore from '../../store/useManagementStore';

// Local Error Boundary for Dashboard Content
class DashboardErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <Paper p="xl" withBorder radius="md" style={{ background: '#fff5f5' }}>
                    <Stack align="center" gap="md">
                        <Text fw={900} size="xl" c="red">Sub-component Crash</Text>
                        <Text size="sm" ta="center">One of the dashboard modules failed to load.</Text>
                        <pre style={{ fontSize: '12px', color: '#e03131', background: '#fff', padding: '10px', borderRadius: '4px' }}>
                            {this.state.error?.toString()}
                        </pre>
                        <Button variant="light" color="red" onClick={() => this.setState({ hasError: false, error: null })}>
                            Try Re-rendering
                        </Button>
                    </Stack>
                </Paper>
            );
        }
        return this.props.children;
    }
}

const Dashboard = ({ onExit }) => {
    const { user, logout, isAdmin } = useManagementStore();
    const [opened, { toggle }] = useDisclosure();
    const theme = useMantineTheme();
    const [active, setActive] = useState('Overview');

    console.log("Dashboard Rendering - Current Mode:", active, "IsAdmin:", isAdmin);

    const handleLogout = async () => {
        await logout();
        onExit();
    };

    const links = [
        { icon: IconLayoutDashboard, label: 'Overview' },
        { icon: IconCalendarEvent, label: 'Bookings' },
        { icon: IconBed, label: 'Rooms' },
        { icon: IconMessage, label: 'Messages' },
        { icon: IconCurrencyDollar, label: 'Payments' },
        { icon: IconSettings, label: 'Settings' },
    ];

    const mainLinks = links.map((link) => (
        <NavLink
            key={link.label}
            label={link.label}
            leftSection={<link.icon size="1.2rem" stroke={1.5} />}
            active={active === link.label}
            onClick={() => setActive(link.label)}
            variant="filled"
            color="blue"
            className="rounded-md my-1 font-medium transition-all duration-200"
        />
    ));

    const renderContent = () => {
        switch (active) {
            case 'Overview':
                return <DashboardOverview />;
            case 'Bookings':
                return <Bookings />;
            case 'Rooms':
                return <Rooms />;
            case 'Messages':
                return <Messages />;
            case 'Payments':
                return <PaymentSettingsPage />;
            case 'Settings':
                return <Settings />;
            default:
                console.log("Dashboard - Rendering default (Overview)");
                return <DashboardOverview />;
        }
    };

    return (
        <AppShell
            header={{ height: 70 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
            className="bg-gray-50 dark:bg-gray-900"
        >
            <AppShell.Header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Group gap="xs">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                                N
                            </div>
                            <Text fw={900} size="xl" className="text-gray-900 dark:text-white tracking-tight">
                                NORDEN<span className="text-blue-600">SUITES</span>
                            </Text>
                        </Group>
                    </Group>

                    <Group>
                        <UnstyledButton className="p-2 text-gray-500 hover:text-blue-600 transition-colors relative">
                            <IconBell size={22} stroke={1.5} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </UnstyledButton>

                        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2"></div>

                        <UnstyledButton
                            className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Avatar radius="xl" size="md" src={null} color="blue">
                                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                            </Avatar>
                            <div className="hidden sm:block text-left">
                                <Text size="sm" fw={600} lh={1}>{user?.first_name} {user?.last_name}</Text>
                                <Text size="xs" c="dimmed" lh={1} mt={2}>{user?.role}</Text>
                            </div>
                        </UnstyledButton>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md" className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <AppShell.Section grow component={ScrollArea}>
                    <div className="mb-6">
                        <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider mb-3 px-3">
                            Main Menu
                        </Text>
                        {mainLinks}
                    </div>
                </AppShell.Section>

                <AppShell.Section className="border-t border-gray-200 dark:border-gray-800 pt-4">
                    <NavLink
                        label="Log Out & Return"
                        leftSection={<IconLogout size="1.2rem" stroke={1.5} />}
                        onClick={handleLogout}
                        variant="subtle"
                        color="red"
                        className="rounded-md font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    />
                    <Text size="xs" c="dimmed" className="text-center mt-4">
                        Developed by <a href="https://www.kkdes.co.ke" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>KKDES</a>
                    </Text>
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                <DashboardErrorBoundary>
                    {renderContent()}
                </DashboardErrorBoundary>
            </AppShell.Main>
        </AppShell>
    );
}

export default Dashboard;
