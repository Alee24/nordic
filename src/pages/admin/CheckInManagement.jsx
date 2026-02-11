import React, { useState, useEffect } from 'react';
import {
    Paper,
    Text,
    Group,
    Stack,
    SimpleGrid,
    Badge,
    ActionIcon,
    Loader,
    Center,
    Button,
    Box,
    Card,
    Avatar,
    Tooltip,
    Divider,
    Tabs,
    ThemeIcon
} from '@mantine/core';
import {
    IconCheck,
    IconClock,
    IconBrush,
    IconUserCheck,
    IconDoorEnter,
    IconId,
    IconSignature,
    IconCircleCheck,
    IconAlertCircle,
    IconRefresh
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { dashboardService } from '../../services/dashboardService';
import dayjs from 'dayjs';

const MOCK_CHECKIN_ROOMS = [
    { id: 'suite-101', title: 'Royal Ocean Suite', status: 'available', last_cleaned_at: '2026-02-11 08:30:00' },
    { id: 'suite-102', title: 'Executive City View', status: 'occupied', last_cleaned_at: '2026-02-10 14:20:00' },
    { id: 'suite-201', title: 'Family Garden Suite', status: 'cleaning', last_cleaned_at: '2026-02-11 09:15:00' },
    { id: 'suite-202', title: 'Luxury Studio', status: 'maintenance', last_cleaned_at: '2026-02-09 11:00:00' },
    { id: 'suite-301', title: 'Presidential Penthouse', status: 'available', last_cleaned_at: '2026-02-11 07:00:00' }
];

const MOCK_CHECKIN_BOOKINGS = [
    {
        id: 'b1',
        suite_id: 'suite-102',
        guest_name: 'Michael Chen',
        check_in: '2026-02-10',
        status: 'checked_in',
        self_checkin_step: 'completed'
    },
    {
        id: 'b2',
        suite_id: 'suite-101',
        guest_name: 'Sarah Johnson',
        check_in: '2026-02-12',
        status: 'confirmed',
        self_checkin_step: 'signed'
    }
];

const CheckInManagement = () => {
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [demoMode, setDemoMode] = useState(true);

    useEffect(() => {
        loadData();
    }, [demoMode]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (demoMode) {
                setTimeout(() => {
                    setRooms(MOCK_CHECKIN_ROOMS);
                    setBookings(MOCK_CHECKIN_BOOKINGS);
                    setLoading(false);
                }, 500);
                return;
            }

            const [roomsRes, bookingsRes] = await Promise.all([
                dashboardService.getRoomStatus(),
                dashboardService.getAllBookings({ status: 'confirmed' }) // Only show confirmed ones ready for check-in
            ]);

            if (roomsRes.success) setRooms(roomsRes.data);
            if (bookingsRes.success) setBookings(bookingsRes.data);
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to sync check-in data', color: 'red' });
        } finally {
            if (!demoMode) setLoading(false);
        }
    };

    const handleRoomStatusUpdate = async (id, status) => {
        const res = await dashboardService.updateRoomStatus(id, status);
        if (res.success) {
            notifications.show({ title: 'Success', message: `Room marked as ${status}`, color: 'green' });
            loadData();
        }
    };

    const handleFinalizeCheckin = async (bookingId) => {
        const res = await dashboardService.finalizeCheckin(bookingId);
        if (res.success) {
            notifications.show({ title: 'Check-in Complete', message: 'Guest has been checked in and room status updated.', color: 'green' });
            loadData();
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'green';
            case 'occupied': return 'blue';
            case 'cleaning': return 'orange';
            case 'maintenance': return 'red';
            default: return 'gray';
        }
    };

    const getStepIcon = (step) => {
        const size = 18;
        switch (step) {
            case 'not_started': return <IconClock size={size} />;
            case 'docs_uploaded': return <IconId size={size} />;
            case 'signed': return <IconSignature size={size} />;
            case 'completed': return <IconCircleCheck size={size} />;
            default: return <IconClock size={size} />;
        }
    };

    const roomCards = rooms.map(room => {
        const activeBooking = bookings.find(b => b.suite_id === room.id);

        return (
            <Card key={room.id} shadow="sm" radius="md" withBorder padding="md">
                <Box mb="md">
                    <Group justify="space-between">
                        <Box>
                            <Text fw={700} size="lg">{room.title}</Text>
                            <Text size="xs" c="dimmed">{room.id}</Text>
                        </Box>
                        <Badge color={getStatusColor(room.status)} variant="outline">
                            {room.status.toUpperCase()}
                        </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" mt={4}>
                        Last cleaned: {room.last_cleaned_at ? dayjs(room.last_cleaned_at).format('MMM D, HH:mm') : 'Never'}
                    </Text>
                </Box>

                <Divider mb="md" variant="dashed" />

                {activeBooking ? (
                    <Stack gap="sm">
                        <Group gap="xs">
                            <Avatar size="sm" color="blue" radius="xl">
                                {activeBooking.guest_name?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Text size="sm" fw={600}>{activeBooking.guest_name}</Text>
                                <Text size="xs" c="dimmed">Check-in: {dayjs(activeBooking.check_in).format('MMM D')}</Text>
                            </Box>
                        </Group>

                        <Paper p="xs" bg="gray.0" radius="sm">
                            <Group justify="space-between">
                                <Group gap="xs">
                                    <ThemeIcon size="sm" color="blue" variant="light">
                                        {getStepIcon(activeBooking.self_checkin_step)}
                                    </ThemeIcon>
                                    <Text size="xs" fw={500}>{activeBooking.self_checkin_step.replace('_', ' ').toUpperCase()}</Text>
                                </Group>
                                {activeBooking.self_checkin_step === 'signed' && (
                                    <Badge color="green" size="xs">READY</Badge>
                                )}
                            </Group>
                        </Paper>

                        {activeBooking.status !== 'checked_in' && (
                            <Button
                                fullWidth
                                size="xs"
                                color="blue"
                                leftSection={<IconDoorEnter size={14} />}
                                disabled={activeBooking.self_checkin_step !== 'signed'}
                                onClick={() => handleFinalizeCheckin(activeBooking.id)}
                            >
                                Finalize Check-in
                            </Button>
                        )}
                    </Stack>
                ) : (
                    <Stack gap="xs" justify="center" h={100} style={{ textAlign: 'center' }}>
                        <Text size="sm" c="dimmed">No arrivals scheduled</Text>
                        {room.status === 'cleaning' && (
                            <Button
                                variant="light"
                                color="green"
                                size="xs"
                                leftSection={<IconCheck size={14} />}
                                onClick={() => handleRoomStatusUpdate(room.id, 'available')}
                            >
                                Mark as Clean
                            </Button>
                        )}
                        {room.status === 'available' && (
                            <Text size="xs" color="green.7">Waiting for next guest</Text>
                        )}
                    </Stack>
                )}

                <Group grow mt="md" gap="xs">
                    <Tooltip label="Mark for Cleaning">
                        <ActionIcon
                            variant="light"
                            color="orange"
                            disabled={room.status === 'cleaning'}
                            onClick={() => handleRoomStatusUpdate(room.id, 'cleaning')}
                        >
                            <IconBrush size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Mark for Maintenance">
                        <ActionIcon
                            variant="light"
                            color="red"
                            disabled={room.status === 'maintenance'}
                            onClick={() => handleRoomStatusUpdate(room.id, 'maintenance')}
                        >
                            <IconAlertCircle size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Card>
        );
    });

    return (
        <Stack gap="lg">
            <Group justify="space-between">
                <Box>
                    <Text size="xl" fw={800}>Live Check-in Board</Text>
                    <Text size="sm" c="dimmed">Monitor room readiness and finalize guest arrivals.</Text>
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
                    <Button
                        variant="subtle"
                        leftSection={<IconRefresh size={16} />}
                        onClick={loadData}
                        loading={loading}
                    >
                        Refresh Board
                    </Button>
                </Group>
            </Group>

            {loading ? (
                <Center h={400}>
                    <Loader size="xl" />
                </Center>
            ) : rooms.length === 0 ? (
                <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
                    <Text>No rooms configured. Add rooms in the Rooms section.</Text>
                </Paper>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
                    {roomCards}
                </SimpleGrid>
            )}
        </Stack>
    );
};

export default CheckInManagement;
