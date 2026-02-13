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
    ScrollArea
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
    IconPlaneDeparture
} from '@tabler/icons-react';

// Components (We will create these next)
import DashboardOverview from './components/DashboardOverview';
import Bookings from './Bookings';
import Rooms from './Rooms';
import CheckInManagement from './CheckInManagement';
import Guests from './Guests';
import Settings from './Settings';
import PaymentSettingsPage from './PaymentSettingsPage';
import FlightTracker from './FlightTracker';
import useManagementStore from '../../store/useManagementStore';

const Dashboard = ({ onExit }) => {
    const { user, logout } = useManagementStore();
    const [opened, { toggle }] = useDisclosure();
    const theme = useMantineTheme();
    const [active, setActive] = useState('Overview');

    const handleLogout = async () => {
        await logout();
        onExit();
    };

    const links = [
        { icon: IconLayoutDashboard, label: 'Overview' },
        { icon: IconDoorEnter, label: 'Check-in' },
        { icon: IconCalendarEvent, label: 'Bookings' },
        { icon: IconBed, label: 'Rooms' },
        { icon: IconUser, label: 'Guests' },
        { icon: IconPlaneDeparture, label: 'Flights' },
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
            case 'Check-in':
                return <CheckInManagement />;
            case 'Bookings':
                return <Bookings />;
            case 'Rooms':
                return <Rooms />;
            case 'Guests':
                return <Guests />;
            case 'Flights':
                return <FlightTracker />;
            case 'Payments':
                return <PaymentSettingsPage />;
            case 'Settings':
                return <Settings />;
            default:
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
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                N
                            </div>
                            <Text fw={900} size="xl" className="text-gray-900 dark:text-white tracking-tight">
                                NORDIC<span className="text-blue-600">ADMIN</span>
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
                                <Text size="xs" c="dimmed" lh={1} mt={2}>{user?.account_type}</Text>
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
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                {renderContent()}
            </AppShell.Main>
        </AppShell>
    );
}

export default Dashboard;
