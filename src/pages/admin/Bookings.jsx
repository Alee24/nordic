import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    Text,
    Group,
    Badge,
    ActionIcon,
    Avatar,
    Menu,
    TextInput,
    Select,
    Button,
    Stack,
    Loader,
    Center,
    Pagination
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
    IconDots,
    IconEye,
    IconSearch,
    IconFilter,
    IconDownload,
    IconCheck,
    IconX
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { dashboardService } from '../../services/dashboardService';

const statusColors = {
    confirmed: 'blue',
    pending: 'yellow',
    checked_in: 'green',
    cancelled: 'red',
    checked_out: 'gray',
};

const paymentColors = {
    paid: 'green',
    pending: 'orange',
    unpaid: 'red',
    refunded: 'gray',
};

const MOCK_BOOKINGS = [
    {
        id: '1',
        guest_name: 'Sarah Johnson',
        guest_email: 'sarah.j@example.com',
        suite_name: 'Royal Ocean Suite',
        check_in: '2026-02-12',
        check_out: '2026-02-15',
        status: 'confirmed',
        payment_status: 'paid',
        total_price: 1250.00
    },
    {
        id: '2',
        guest_name: 'Michael Chen',
        guest_email: 'm.chen@example.com',
        suite_name: 'Deluxe City View',
        check_in: '2026-02-10',
        check_out: '2026-02-14',
        status: 'checked_in',
        payment_status: 'paid',
        total_price: 840.00
    },
    {
        id: '3',
        guest_name: 'Emma Wilson',
        guest_email: 'emma.w@example.com',
        suite_name: 'Penthouse Apartment',
        check_in: '2026-02-18',
        check_out: '2026-02-25',
        status: 'pending',
        payment_status: 'unpaid',
        total_price: 3500.00
    },
    {
        id: '4',
        guest_name: 'David Miller',
        guest_email: 'd.miller@example.com',
        suite_name: 'Standard Studios',
        check_in: '2026-02-08',
        check_out: '2026-02-11',
        status: 'checked_out',
        payment_status: 'paid',
        total_price: 450.00
    },
    {
        id: '5',
        guest_name: 'Linda Garcia',
        guest_email: 'linda.g@example.com',
        suite_name: 'Luxury Villa',
        check_in: '2026-02-20',
        check_out: '2026-02-27',
        status: 'confirmed',
        payment_status: 'pending',
        total_price: 2800.00
    }
];

const Bookings = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [demoMode, setDemoMode] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        date_from: null,
        date_to: null
    });

    useEffect(() => {
        fetchBookings();
    }, [filters, demoMode]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            if (demoMode) {
                // Apply simple local filtering for demo
                let filtered = [...MOCK_BOOKINGS];
                if (filters.search) {
                    const search = filters.search.toLowerCase();
                    filtered = filtered.filter(b =>
                        b.guest_name.toLowerCase().includes(search) ||
                        b.guest_email.toLowerCase().includes(search) ||
                        b.suite_name.toLowerCase().includes(search)
                    );
                }
                if (filters.status) {
                    filtered = filtered.filter(b => b.status === filters.status);
                }
                setTimeout(() => {
                    setData(filtered);
                    setLoading(false);
                }, 500);
                return;
            }

            // Format dates for API
            const apiFilters = {
                ...filters,
                date_from: filters.date_from ? filters.date_from.toISOString().split('T')[0] : '',
                date_to: filters.date_to ? filters.date_to.toISOString().split('T')[0] : ''
            };

            // Remove empty keys
            Object.keys(apiFilters).forEach(key => apiFilters[key] === '' && delete apiFilters[key]);

            const response = await dashboardService.getAllBookings(apiFilters);
            if (response.success) {
                setData(response.data);
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red'
            });
        } finally {
            if (!demoMode) setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (demoMode) {
            setData(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
            notifications.show({
                title: 'Demo Mode',
                message: 'Status updated locally for demonstration',
                color: 'blue'
            });
            return;
        }
        try {
            const response = await dashboardService.updateBookingStatus(id, newStatus);
            if (response.success) {
                notifications.show({
                    title: 'Success',
                    message: 'Booking status updated successfully',
                    color: 'green'
                });
                fetchBookings(); // Refresh list
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red'
            });
        }
    };

    const rows = data.map((booking) => (
        <Table.Tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <Table.Td>
                <Group gap="sm">
                    <Avatar color="blue" radius="xl">
                        {booking.guest_name ? booking.guest_name.charAt(0) : 'G'}
                    </Avatar>
                    <div>
                        <Text fz="sm" fw={500}>
                            {booking.guest_name || 'Guest'}
                        </Text>
                        <Text c="dimmed" fz="xs">
                            {booking.guest_email || 'No email'}
                        </Text>
                    </div>
                </Group>
            </Table.Td>

            <Table.Td>
                <Text fz="sm">{booking.suite_name || 'Room'}</Text>
            </Table.Td>

            <Table.Td>
                <Text fz="sm">{booking.check_in}</Text>
                <Text c="dimmed" fz="xs">to {booking.check_out}</Text>
            </Table.Td>

            <Table.Td>
                <Badge
                    color={statusColors[booking.status] || 'gray'}
                    variant="light"
                >
                    {booking.status}
                </Badge>
            </Table.Td>

            <Table.Td>
                <Badge
                    color={paymentColors[booking.payment_status] || 'gray'}
                    variant="dot"
                >
                    {booking.payment_status}
                </Badge>
            </Table.Td>

            <Table.Td>
                <Text fw={700} fz="sm">
                    ${Number(booking.total_price).toLocaleString()}
                </Text>
            </Table.Td>

            <Table.Td>
                <Menu transitionProps={{ transition: 'pop' }} withArrow position="bottom-end" withinPortal>
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                            <IconDots style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Actions</Menu.Label>
                        <Menu.Item leftSection={<IconEye style={{ width: 14, height: 14 }} />}>
                            View Details
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Label>Update Status</Menu.Label>
                        {booking.status !== 'confirmed' && (
                            <Menu.Item
                                leftSection={<IconCheck style={{ width: 14, height: 14 }} />}
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            >
                                Confirm Booking
                            </Menu.Item>
                        )}

                        {booking.status === 'confirmed' && (
                            <Menu.Item
                                leftSection={<IconCheck style={{ width: 14, height: 14 }} />}
                                onClick={() => handleStatusUpdate(booking.id, 'checked_in')}
                            >
                                Check In Guest
                            </Menu.Item>
                        )}

                        {booking.status !== 'cancelled' && (
                            <Menu.Item
                                leftSection={<IconX style={{ width: 14, height: 14 }} />}
                                color="red"
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            >
                                Cancel Booking
                            </Menu.Item>
                        )}
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <div>
                    <Text size="xl" fw={800} className="text-gray-900 dark:text-white">Bookings</Text>
                    <Text size="sm" c="dimmed">Manage all room reservations.</Text>
                </div>
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
                    <Button leftSection={<IconDownload size={16} />} variant="light">
                        Export CSV
                    </Button>
                </Group>
            </Group>

            {/* Filters */}
            <Paper p="md" radius="md" withBorder>
                <Group align="flex-end">
                    <TextInput
                        label="Search"
                        placeholder="Guest name, email, or room..."
                        leftSection={<IconSearch size={16} />}
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="flex-1"
                    />
                    <Select
                        label="Status"
                        placeholder="All Statuses"
                        data={[
                            { value: '', label: 'All Statuses' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'checked_in', label: 'Checked In' },
                            { value: 'cancelled', label: 'Cancelled' }
                        ]}
                        value={filters.status}
                        onChange={(val) => setFilters({ ...filters, status: val })}
                        style={{ width: 200 }}
                    />
                    <DatePickerInput
                        label="Check-in Date"
                        placeholder="Pick date"
                        value={filters.date_from}
                        onChange={(date) => setFilters({ ...filters, date_from: date })}
                        clearable
                        style={{ width: 200 }}
                    />
                </Group>
            </Paper>

            {/* Table */}
            <Paper withBorder p="md" radius="md">
                {loading ? (
                    <Center h={300}>
                        <Loader size="lg" />
                    </Center>
                ) : data.length === 0 ? (
                    <Center h={300}>
                        <Stack align="center" gap="xs">
                            <IconSearch size={40} className="text-gray-300" />
                            <Text c="dimmed">No bookings found matching your filters.</Text>
                        </Stack>
                    </Center>
                ) : (
                    <>
                        <Table verticalSpacing="sm" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Guest</Table.Th>
                                    <Table.Th>Suite</Table.Th>
                                    <Table.Th>Stay Dates</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Payment</Table.Th>
                                    <Table.Th>Total</Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {rows}
                            </Table.Tbody>
                        </Table>

                        {/* Pagination Placeholder - Ideally implement backend pagination */}
                        <Group justify="flex-end" mt="md">
                            <Pagination total={1} />
                        </Group>
                    </>
                )}
            </Paper>
        </Stack>
    );
};

export default Bookings;
