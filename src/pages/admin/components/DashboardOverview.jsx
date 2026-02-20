import React, { useEffect, useState } from 'react';
import { Grid, Stack, Loader, Center, Blockquote, Text, Group, Box, Button, SimpleGrid, Paper, ThemeIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';

import { dashboardService } from '../../../services/dashboardService';
import { StatsGrid } from './StatsGrid';
import { RevenueChart } from './RevenueChart';
import { RecentBookingsTable } from './RecentBookingsTable';

const DashboardOverview = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [demoMode, setDemoMode] = useState(false); // Default to live
    const [data, setData] = useState({
        stats: null,
        recentBookings: [],
        revenue: [],
        occupancy: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, [demoMode]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, bookingsRes, revenueRes, occupancyRes] = await Promise.allSettled([
                dashboardService.getStatistics(demoMode),
                dashboardService.getRecentBookings(10, demoMode),
                dashboardService.getMonthlyRevenue(12),
                dashboardService.getOccupancyTrends(30)
            ]);

            console.log("Dashboard Data Fetch Results:", { statsRes, bookingsRes, revenueRes, occupancyRes });

            const stats = statsRes.status === 'fulfilled' && statsRes.value.success ? statsRes.value.data : null;
            const bookings = bookingsRes.status === 'fulfilled' && bookingsRes.value.success ? bookingsRes.value.data : [];
            const revenue = revenueRes.status === 'fulfilled' && revenueRes.value.success ? revenueRes.value.data : [];
            const occupancy = occupancyRes.status === 'fulfilled' && occupancyRes.value.success ? occupancyRes.value.data : [];

            if (!stats && !demoMode) {
                // If it's not demo mode and stats failed, don't throw - showing a message is better
                console.warn('Crucial dashboard statistics missing from API.');
            }

            setData({
                stats: stats || (demoMode ? {
                    monthly_revenue: 124500,
                    occupancy_rate: 85,
                    revenue_per_room: 450,
                    total_guests: 1240,
                    today_checkins: 12,
                    today_checkouts: 8,
                    maintenance_alerts: 2
                } : null),
                recentBookings: bookings.length > 0 ? bookings : (demoMode ? [
                    { id: '1', guest_name: 'John Doe', suite_name: 'Presidential Suite', check_in: '2024-02-11', status: 'Confirmed', total_price: 1200 },
                    { id: '2', guest_name: 'Jane Smith', suite_name: 'Ocean View Deluxe', check_in: '2024-02-12', status: 'Pending', total_price: 850 }
                ] : []),
                revenue: revenue.length > 0 ? revenue : (demoMode ? [
                    { month: 'Jan', revenue: 45000 },
                    { month: 'Feb', revenue: 52000 },
                    { month: 'Mar', revenue: 48000 }
                ] : []),
                occupancy: occupancy
            });

            if (!stats && demoMode) {
                notifications.show({
                    title: 'Offline Mode',
                    message: 'Using simulated data as the live API is currently unreachable.',
                    color: 'orange',
                    icon: <IconInfoCircle />,
                });
            }

        } catch (err) {
            console.error('Dashboard Load Error:', err);
            setError(err.message);
            notifications.show({
                title: 'Connection Error',
                message: 'Failed to reach the server. Please check your API/Apache configuration.',
                color: 'red',
                icon: <IconInfoCircle />,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Center h={400}>
                <Loader size="xl" type="dots" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center h={400}>
                <Stack align="center" gap="md">
                    <ThemeIcon size={64} radius="xl" color="red" variant="light">
                        <IconAlertCircle size={32} />
                    </ThemeIcon>
                    <Text fw={800} size="xl">Content Error</Text>
                    <Text c="dimmed" maw={400} ta="center">{error}</Text>
                    <Group mt="md">
                        <Button variant="light" color="blue" onClick={fetchDashboardData}>Retry Connection</Button>
                        <Button variant="filled" color="blue" onClick={() => {
                            setDemoMode(true);
                            setError(null);
                        }}>Enter Demo Mode</Button>
                    </Group>
                </Stack>
            </Center>
        );
    }

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="end" className="mb-2">
                <Box>
                    <Text size="xl" fw={800} className="text-gray-900 dark:text-white">Overview</Text>
                    <Text size="sm" c="dimmed">Welcome back, here's what's happening at Norden today.</Text>
                </Box>
                <Paper shadow="xs" p={4} radius="xl" className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex">
                    <button
                        onClick={() => setDemoMode(false)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!demoMode ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        LIVE
                    </button>
                    <button
                        onClick={() => setDemoMode(true)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${demoMode ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        DEMO
                    </button>
                </Paper>
            </Group>

            <StatsGrid data={data.stats} />

            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <RevenueChart data={data.revenue} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack h="100%">
                        <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <Text fw={800} size="lg" mb="xs">Today's Operations</Text>
                                <SimpleGrid cols={2} spacing="md" mt="xl">
                                    <Box>
                                        <Text size="xs" className="opacity-70 uppercase font-bold tracking-wider">Arrivals</Text>
                                        <Text size="xl" fw={900}>{data.stats?.today_checkins || 0}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" className="opacity-70 uppercase font-bold tracking-wider">Departures</Text>
                                        <Text size="xl" fw={900}>{data.stats?.today_checkouts ?? 0}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" className="opacity-70 uppercase font-bold tracking-wider">Cleaning</Text>
                                        <Text size="xl" fw={900}>5</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" className="opacity-70 uppercase font-bold tracking-wider">Maintenance</Text>
                                        <Text size="xl" fw={900}>{data.stats?.maintenance_alerts || 0}</Text>
                                    </Box>
                                </SimpleGrid>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                            <Text fw={700} className="border-b border-gray-100 dark:border-gray-700" mb="md" pb="xs">Quick Actions</Text>
                            <SimpleGrid cols={2} spacing="sm">
                                <Button variant="light" color="blue" radius="md" size="compact-sm">New Booking</Button>
                                <Button variant="light" color="teal" radius="md" size="compact-sm">Check In</Button>
                                <Button variant="light" color="orange" radius="md" size="compact-sm">Add Room</Button>
                                <Button variant="light" color="grape" radius="md" size="compact-sm">System Logs</Button>
                            </SimpleGrid>
                        </div>
                    </Stack>
                </Grid.Col>
            </Grid>

            <RecentBookingsTable data={data.recentBookings} />
        </Stack>
    );
};

export default DashboardOverview;
