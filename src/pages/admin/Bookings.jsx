import React, { useState, useEffect, useMemo } from 'react';
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
    Pagination,
    Card,
    SimpleGrid,
    Drawer,
    ScrollArea,
    Divider,
    ThemeIcon,
    Tooltip
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
    IconDots,
    IconEye,
    IconSearch,
    IconFilter,
    IconDownload,
    IconCheck,
    IconX,
    IconCalendarEvent,
    IconUser,
    IconHome,
    IconCreditCard,
    IconClock,
    IconMail,
    IconPhone,
    IconChevronRight
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
        guest_phone: '+1 234 567 8901',
        suite_name: 'Royal Ocean Suite',
        check_in: '2026-02-12',
        check_out: '2026-02-15',
        status: 'confirmed',
        payment_status: 'paid',
        total_price: 1250.00,
        booking_reference: 'BR-A1B2C3'
    },
    {
        id: '2',
        guest_name: 'Michael Chen',
        guest_email: 'm.chen@example.com',
        guest_phone: '+1 987 654 3210',
        suite_name: 'Deluxe City View',
        check_in: '2026-02-10',
        check_out: '2026-02-14',
        status: 'checked_in',
        payment_status: 'paid',
        total_price: 840.00,
        booking_reference: 'BR-D4E5F6'
    },
    {
        id: '3',
        guest_name: 'Emma Wilson',
        guest_email: 'emma.w@example.com',
        guest_phone: '+1 555 012 3456',
        suite_name: 'Penthouse Apartment',
        check_in: '2026-02-18',
        check_out: '2026-02-25',
        status: 'pending',
        payment_status: 'unpaid',
        total_price: 3500.00,
        booking_reference: 'BR-G7H8I9'
    }
];

const Bookings = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [demoMode, setDemoMode] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [drawerOpened, setDrawerOpened] = useState(false);
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

            const apiFilters = {
                ...filters,
                date_from: filters.date_from ? filters.date_from.toISOString().split('T')[0] : '',
                date_to: filters.date_to ? filters.date_to.toISOString().split('T')[0] : ''
            };

            Object.keys(apiFilters).forEach(key => apiFilters[key] === '' && delete apiFilters[key]);

            const response = await dashboardService.getAllBookings(apiFilters, demoMode);
            if (response.success) {
                setData(Array.isArray(response.data) ? response.data : []);
            } else {
                setData([]);
                throw new Error(response.error);
            }
        } catch (error) {
            setData([]);
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to sync with live database',
                color: 'red'
            });
        } finally {
            if (!demoMode) setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (demoMode) {
            setData(prev => (Array.isArray(prev) ? prev : []).map(b => b.id === id ? { ...b, status: newStatus } : b));
            notifications.show({ title: 'Demo Mode', message: 'Status updated locally', color: 'blue' });
            return;
        }
        try {
            const response = await dashboardService.updateBookingStatus(id, newStatus);
            if (response.success) {
                notifications.show({ title: 'Success', message: 'Booking status updated', color: 'green' });
                fetchBookings();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            notifications.show({ title: 'Error', message: error.message, color: 'red' });
        }
    };

    const stats = useMemo(() => {
        const bookingsList = Array.isArray(data) ? data : [];
        return {
            total: bookingsList.length,
            confirmed: bookingsList.filter(b => b.status === 'confirmed').length,
            pending: bookingsList.filter(b => b.status === 'pending').length,
            revenue: bookingsList.reduce((acc, b) => acc + (Number(b.totalPrice) || Number(b.total_price) || 0), 0)
        };
    }, [data]);

    const openDetails = (booking) => {
        setSelectedBooking(booking);
        setDrawerOpened(true);
    };

    const rows = (Array.isArray(data) ? data : []).map((booking) => {
        if (!booking) return null;

        // Map backend Prisma fields to UI expected fields
        const guestName = booking.user?.name || booking.guest_name || 'Guest';
        const guestEmail = booking.user?.email || booking.guest_email || 'No email';
        const suiteName = booking.room?.name || booking.suite_name || 'Standard Suite';
        const reference = booking.reference || booking.booking_reference || 'N/A';
        const price = booking.totalPrice ? Number(booking.totalPrice) : (booking.total_price ? Number(booking.total_price) : 0);
        const checkIn = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : (booking.check_in || 'N/A');
        const checkOut = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : (booking.check_out || 'N/A');
        const paymentStatus = booking.paymentStatus || booking.payment_status || 'pending';

        return (
            <Table.Tr
                key={booking.id || Math.random()}
                onClick={() => openDetails({
                    ...booking,
                    guest_name: guestName,
                    guest_email: guestEmail,
                    suite_name: suiteName,
                    booking_reference: reference,
                    total_price: price,
                    check_in: checkIn,
                    check_out: checkOut,
                    payment_status: paymentStatus
                })}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-b border-slate-100 dark:border-slate-800"
            >
                <Table.Td>
                    <Group gap="sm">
                        <Avatar color="blue" radius="md" variant="light">
                            {guestName.charAt(0)}
                        </Avatar>
                        <div>
                            <Text fz="sm" fw={600} className="text-slate-900 dark:text-slate-100">
                                {guestName}
                            </Text>
                            <Text c="dimmed" fz="xs">
                                {guestEmail}
                            </Text>
                        </div>
                    </Group>
                </Table.Td>

                <Table.Td>
                    <Stack gap={0}>
                        <Text fz="sm" fw={500}>{suiteName}</Text>
                        <Text c="dimmed" fz="xs">Ref: {reference}</Text>
                    </Stack>
                </Table.Td>

                <Table.Td>
                    <Group gap="xs">
                        <Stack gap={0}>
                            <Text fz="xs" fw={700} c="dimmed">IN</Text>
                            <Text fz="sm">{checkIn}</Text>
                        </Stack>
                        <IconChevronRight size={14} className="text-slate-300" />
                        <Stack gap={0}>
                            <Text fz="xs" fw={700} c="dimmed">OUT</Text>
                            <Text fz="sm">{checkOut}</Text>
                        </Stack>
                    </Group>
                </Table.Td>

                <Table.Td>
                    <Badge
                        color={statusColors[booking.status] || 'gray'}
                        variant="dot"
                        className="capitalize px-2 py-3"
                    >
                        {booking.status?.replace('_', ' ') || 'unknown'}
                    </Badge>
                </Table.Td>

                <Table.Td>
                    <Badge
                        color={paymentColors[paymentStatus] || 'gray'}
                        variant="light"
                        className="capitalize"
                    >
                        {paymentStatus}
                    </Badge>
                </Table.Td>

                <Table.Td>
                    <Text fw={800} fz="sm" className="text-slate-900 dark:text-white">
                        KES {price.toLocaleString()}
                    </Text>
                </Table.Td>

                <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <IconDots size={18} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconEye size={14} />} onClick={() => openDetails(booking)}>View Details</Menu.Item>
                            <Divider />
                            {booking.status !== 'confirmed' && (
                                <Menu.Item leftSection={<IconCheck size={14} color="green" />} onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>Confirm</Menu.Item>
                            )}
                            {booking.status === 'confirmed' && (
                                <Menu.Item leftSection={<IconCheck size={14} color="blue" />} onClick={() => handleStatusUpdate(booking.id, 'checked_in')}>Check In</Menu.Item>
                            )}
                            {booking.status !== 'cancelled' && (
                                <Menu.Item leftSection={<IconX size={14} color="red" />} color="red" onClick={() => handleStatusUpdate(booking.id, 'cancelled')}>Cancel</Menu.Item>
                            )}
                        </Menu.Dropdown>
                    </Menu>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Stack gap="xl" className="p-2">
            <Group justify="space-between">
                <div>
                    <Text fz={28} fw={900} className="tracking-tight text-slate-900 dark:text-white">Reservations</Text>
                    <Text fz="sm" c="dimmed" fw={500}>Monitor and manage all apartment bookings across your property.</Text>
                </div>
                <Group gap="md">
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
                    <Button variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} radius="md" leftSection={<IconDownload size={18} />}>
                        Reports
                    </Button>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} gap="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder className="border-l-4 border-l-blue-500">
                    <Group justify="space-between">
                        <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                            <IconCalendarEvent size={24} />
                        </ThemeIcon>
                        <Badge variant="light" color="blue">Total</Badge>
                    </Group>
                    <Text fz="xs" c="dimmed" fw={700} tt="uppercase" mt="md">All Bookings</Text>
                    <Text fz="xl" fw={900}>{stats.total}</Text>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder className="border-l-4 border-l-yellow-500">
                    <Group justify="space-between">
                        <ThemeIcon color="yellow" variant="light" size="xl" radius="md">
                            <IconClock size={24} />
                        </ThemeIcon>
                        <Badge variant="light" color="yellow">Pending</Badge>
                    </Group>
                    <Text fz="xs" c="dimmed" fw={700} tt="uppercase" mt="md">Pending Approval</Text>
                    <Text fz="xl" fw={900}>{stats.pending}</Text>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder className="border-l-4 border-l-green-500">
                    <Group justify="space-between">
                        <ThemeIcon color="green" variant="light" size="xl" radius="md">
                            <IconCheck size={24} />
                        </ThemeIcon>
                        <Badge variant="light" color="green">Confirmed</Badge>
                    </Group>
                    <Text fz="xs" c="dimmed" fw={700} tt="uppercase" mt="md">Confirmed Stays</Text>
                    <Text fz="xl" fw={900}>{stats.confirmed}</Text>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder className="border-l-4 border-l-violet-500">
                    <Group justify="space-between">
                        <ThemeIcon color="violet" variant="light" size="xl" radius="md">
                            <IconCreditCard size={24} />
                        </ThemeIcon>
                        <Badge variant="light" color="violet">Gross</Badge>
                    </Group>
                    <Text fz="xs" c="dimmed" fw={700} tt="uppercase" mt="md">Total Revenue</Text>
                    <Text fz="xl" fw={900}>KES {stats.revenue.toLocaleString()}</Text>
                </Card>
            </SimpleGrid>

            <Paper shadow="sm" radius="md" p="md" withBorder className="bg-slate-50/50 dark:bg-slate-900/50">
                <Group align="flex-end">
                    <TextInput
                        placeholder="Search by name, email, or suite..."
                        leftSection={<IconSearch size={16} />}
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="flex-1"
                        radius="md"
                    />
                    <Select
                        placeholder="Status"
                        data={[
                            { value: '', label: 'All Statuses' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'checked_in', label: 'Checked In' },
                            { value: 'checked_out', label: 'Checked Out' },
                            { value: 'cancelled', label: 'Cancelled' }
                        ]}
                        value={filters.status}
                        onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                        radius="md"
                        style={{ width: 180 }}
                    />
                    <DatePickerInput
                        placeholder="Arrival Date"
                        value={filters.date_from}
                        onChange={(date) => setFilters(prev => ({ ...prev, date_from: date }))}
                        radius="md"
                        clearable
                        style={{ width: 180 }}
                    />
                </Group>
            </Paper>

            <Card shadow="sm" radius="md" withBorder padding={0}>
                <ScrollArea h={loading ? 300 : 'auto'}>
                    {loading ? (
                        <Center h={300}><Loader type="bars" /></Center>
                    ) : rows.length === 0 ? (
                        <Center h={300}>
                            <Stack align="center" gap="xs">
                                <IconSearch size={48} stroke={1.5} className="text-slate-300" />
                                <Text fw={600} c="dimmed">No reservations found</Text>
                                <Button variant="subtle" size="xs" onClick={() => setFilters({ status: '', search: '', date_from: null, date_to: null })}>Reset all filters</Button>
                            </Stack>
                        </Center>
                    ) : (
                        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover={false}>
                            <Table.Thead className="bg-slate-50 dark:bg-slate-800">
                                <Table.Tr>
                                    <Table.Th>GUEST INFORMATION</Table.Th>
                                    <Table.Th>SUITE / REF</Table.Th>
                                    <Table.Th>STAY DATES</Table.Th>
                                    <Table.Th>STATUS</Table.Th>
                                    <Table.Th>PAYMENT</Table.Th>
                                    <Table.Th>TOTAL</Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                    )}
                </ScrollArea>
                <Divider />
                <Group justify="space-between" p="md">
                    <Text fz="xs" c="dimmed" fw={500}>Showing {rows.length} results</Text>
                    <Pagination total={1} radius="md" size="sm" />
                </Group>
            </Card>

            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                position="right"
                size="md"
                title={<Text fw={900} fz="xl">Booking Details</Text>}
                padding="xl"
            >
                {selectedBooking && (
                    <Stack gap="xl">
                        <Paper withBorder p="md" radius="md" className="bg-blue-50/50 border-blue-100">
                            <Group justify="space-between">
                                <Text fw={800} fz="sm" c="blue">#{selectedBooking.booking_reference || 'REF-TBD'}</Text>
                                <Badge color={statusColors[selectedBooking.status]}>{selectedBooking.status}</Badge>
                            </Group>
                        </Paper>

                        <div>
                            <Text fw={700} fz="sm" mb="md" tt="uppercase" c="dimmed" className="tracking-wider">Guest Details</Text>
                            <Group mb="sm">
                                <ThemeIcon variant="light" radius="xl"><IconUser size={16} /></ThemeIcon>
                                <Text fw={600}>{selectedBooking.guest_name}</Text>
                            </Group>
                            <Group mb="sm">
                                <ThemeIcon variant="light" radius="xl"><IconMail size={16} /></ThemeIcon>
                                <Text fz="sm">{selectedBooking.guest_email}</Text>
                            </Group>
                            <Group>
                                <ThemeIcon variant="light" radius="xl"><IconPhone size={16} /></ThemeIcon>
                                <Text fz="sm">{selectedBooking.guest_phone || 'Not provided'}</Text>
                            </Group>
                        </div>

                        <Divider />

                        <div>
                            <Text fw={700} fz="sm" mb="md" tt="uppercase" c="dimmed" className="tracking-wider">Reservation</Text>
                            <Group mb="sm">
                                <ThemeIcon variant="light" radius="xl" color="violet"><IconHome size={16} /></ThemeIcon>
                                <Text fw={600}>{selectedBooking.suite_name}</Text>
                            </Group>
                            <Group mb="sm">
                                <ThemeIcon variant="light" radius="xl" color="cyan"><IconCalendarEvent size={16} /></ThemeIcon>
                                <Text fz="sm">{selectedBooking.check_in} — {selectedBooking.check_out}</Text>
                            </Group>
                        </div>

                        <Divider />

                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                            <Group justify="space-between" mb="xs">
                                <Text fz="sm" c="dimmed">Payment Status</Text>
                                <Badge variant="filled" color={paymentColors[selectedBooking.payment_status]}>{selectedBooking.payment_status}</Badge>
                            </Group>
                            <Group justify="space-between">
                                <Text fw={700}>Total Amount Paid</Text>
                                <Text fw={900} fz="xl" c="blue">KES {Number(selectedBooking.total_price).toLocaleString()}</Text>
                            </Group>
                        </div>

                        <Group mt="xl" grow>
                            <Button variant="light" color="red">Delete Record</Button>
                            <Button
                                variant="filled"
                                onClick={() => {
                                    try {
                                        console.log('Download Invoice clicked for booking:', selectedBooking.id);
                                        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8569/backend/api';
                                        const baseUrl = apiUrl.replace('/api', '');
                                        const invoiceUrl = `${baseUrl}/api/invoice.php?id=${selectedBooking.id}`;
                                        console.log('Invoice URL:', invoiceUrl);

                                        // Try to open in new window
                                        const newWindow = window.open(invoiceUrl, '_blank');

                                        if (!newWindow) {
                                            // Fallback if popup blocked
                                            console.warn('Popup blocked, trying location.href');
                                            window.location.href = invoiceUrl;
                                        } else {
                                            notifications.show({
                                                title: 'Invoice Generated',
                                                message: 'Opening invoice in new window. Use browser print to save as PDF.',
                                                color: 'blue'
                                            });
                                        }
                                    } catch (error) {
                                        console.error('Invoice download error:', error);
                                        notifications.show({
                                            title: 'Error',
                                            message: 'Failed to open invoice. Check console for details.',
                                            color: 'red'
                                        });
                                    }
                                }}
                            >
                                Download Invoice
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Drawer>
        </Stack>
    );
};

export default Bookings;
