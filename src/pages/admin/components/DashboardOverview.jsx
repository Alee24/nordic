import React, { useEffect, useState, useCallback } from 'react';
import {
    Grid, Stack, Loader, Center, Text, Group, Box, Button, SimpleGrid,
    Paper, ThemeIcon, Badge, ActionIcon, Tooltip
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconAlertCircle, IconRefresh, IconCalendarPlus, IconHomePlus,
    IconPlaneDeparture, IconPlaneArrival, IconTool, IconBuildingSkyscraper
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { dashboardService } from '../../../services/dashboardService';
import { StatsGrid } from './StatsGrid';
import { RevenueChart } from './RevenueChart';
import { RecentBookingsTable } from './RecentBookingsTable';

const DashboardOverview = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [data, setData] = useState({
        stats: null,
        recentBookings: [],
        revenue: [],
    });

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, bookingsRes, revenueRes] = await Promise.allSettled([
                dashboardService.getStatistics(),
                dashboardService.getRecentBookings(8),
                dashboardService.getMonthlyRevenue(12),
            ]);

            const stats = statsRes.status === 'fulfilled' && statsRes.value.success ? statsRes.value.data : null;
            const bookings = bookingsRes.status === 'fulfilled' && bookingsRes.value.success ? bookingsRes.value.data : [];
            const revenue = revenueRes.status === 'fulfilled' && revenueRes.value.success ? revenueRes.value.data : [];

            if (!stats) {
                throw new Error('Could not load dashboard statistics from the server.');
            }

            setData({ stats, recentBookings: bookings, revenue });
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Dashboard Load Error:', err);
            setError(err.message);
            notifications.show({
                title: 'Dashboard Error',
                message: err.message || 'Failed to load dashboard data.',
                color: 'red',
                icon: <IconAlertCircle />,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <Center h={400}>
                <Stack align="center" gap="sm">
                    <Loader size="lg" type="dots" color="indigo" />
                    <Text c="dimmed" fz="sm">Loading live data…</Text>
                </Stack>
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
                    <Text fw={800} size="xl">Unable to load dashboard</Text>
                    <Text c="dimmed" maw={420} ta="center">{error}</Text>
                    <Button leftSection={<IconRefresh size={16} />} onClick={fetchDashboardData} color="indigo">
                        Retry
                    </Button>
                </Stack>
            </Center>
        );
    }

    const { stats, recentBookings, revenue } = data;

    return (
        <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between" align="flex-start">
                <Box>
                    <Text size="xl" fw={900} style={{ letterSpacing: '-0.02em' }}>Overview</Text>
                    <Text size="sm" c="dimmed">Live data from Norden Suites</Text>
                </Box>
                <Group gap="sm">
                    {lastUpdated && (
                        <Text fz="xs" c="dimmed">
                            Updated {lastUpdated.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    )}
                    <Tooltip label="Refresh data">
                        <ActionIcon variant="light" color="gray" radius="xl" onClick={fetchDashboardData}>
                            <IconRefresh size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            {/* KPI Cards */}
            <StatsGrid data={stats} />

            {/* Revenue Chart + Today's Panel */}
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <RevenueChart data={revenue} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack h="100%" gap="md">
                        {/* Today's Operations */}
                        <Paper
                            radius="lg"
                            p="xl"
                            style={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 40%, #228be6 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                            <div style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                            <Box style={{ position: 'relative', zIndex: 1 }}>
                                <Group gap="xs" mb="lg">
                                    <IconBuildingSkyscraper size={18} style={{ opacity: 0.9 }} />
                                    <Text fw={800} fz="md">Today's Operations</Text>
                                </Group>
                                <SimpleGrid cols={2} spacing="md">
                                    <Box>
                                        <Group gap={4} mb={2}>
                                            <IconPlaneArrival size={14} style={{ opacity: 0.7 }} />
                                            <Text fz="xs" style={{ opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Arrivals</Text>
                                        </Group>
                                        <Text fz="2rem" fw={900}>{stats?.todayArrivals ?? 0}</Text>
                                    </Box>
                                    <Box>
                                        <Group gap={4} mb={2}>
                                            <IconPlaneDeparture size={14} style={{ opacity: 0.7 }} />
                                            <Text fz="xs" style={{ opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Departures</Text>
                                        </Group>
                                        <Text fz="2rem" fw={900}>{stats?.todayDepartures ?? 0}</Text>
                                    </Box>
                                    <Box>
                                        <Group gap={4} mb={2}>
                                            <IconTool size={14} style={{ opacity: 0.7 }} />
                                            <Text fz="xs" style={{ opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Maintenance</Text>
                                        </Group>
                                        <Text fz="2rem" fw={900}>{stats?.maintenanceRooms ?? 0}</Text>
                                    </Box>
                                    <Box>
                                        <Text fz="xs" style={{ opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 2 }}>Available</Text>
                                        <Text fz="2rem" fw={900}>{stats?.availableRooms ?? 0}</Text>
                                    </Box>
                                </SimpleGrid>
                            </Box>
                        </Paper>

                        {/* Quick Actions */}
                        <Paper withBorder radius="lg" p="xl">
                            <Text fw={700} fz="md" mb="md">Quick Actions</Text>
                            <Stack gap="sm">
                                <Button
                                    fullWidth
                                    variant="light"
                                    color="indigo"
                                    radius="md"
                                    leftSection={<IconCalendarPlus size={16} />}
                                    onClick={() => navigate('/admin/bookings')}
                                >
                                    View Bookings
                                </Button>
                                <Button
                                    fullWidth
                                    variant="light"
                                    color="teal"
                                    radius="md"
                                    leftSection={<IconHomePlus size={16} />}
                                    onClick={() => navigate('/admin/rooms')}
                                >
                                    Manage Rooms
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>

            {/* Recent Bookings */}
            <RecentBookingsTable data={recentBookings} />
        </Stack>
    );
};

export default DashboardOverview;
