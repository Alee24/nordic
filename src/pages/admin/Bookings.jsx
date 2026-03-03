import React, { useState, useEffect, useMemo } from 'react';
import {
    Paper, Table, Text, Group, Badge, ActionIcon,
    Avatar, Menu, TextInput, Select, Button, Stack,
    Loader, Center, Pagination, Card, SimpleGrid,
    ScrollArea, Divider, ThemeIcon, Box, Grid,
    Title, Container
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
    IconDots, IconEye, IconSearch, IconDownload,
    IconCheck, IconX, IconCalendarEvent, IconUser,
    IconHome, IconCreditCard, IconClock, IconMail,
    IconPhone, IconChevronRight, IconTrash, IconSend,
    IconArrowLeft, IconReceipt2, IconPrinter
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { dashboardService } from '../../services/dashboardService';
import api from '../../services/api';

const statusColors = {
    confirmed: 'blue', pending: 'yellow', checked_in: 'green',
    cancelled: 'red', checked_out: 'gray',
};
const paymentColors = {
    paid: 'green', pending: 'orange', unpaid: 'red', refunded: 'gray',
};

// Normalise a raw booking record from the API into a flat UI shape
const normalise = (b) => ({
    ...b,
    guest_name: b.guestName || (b.user ? `${b.user.firstName || ''} ${b.user.lastName || ''}`.trim() : '') || b.guest_name || 'Guest',
    guest_email: b.guestEmail || b.user?.email || b.guest_email || '',
    guest_phone: b.guestPhone || b.user?.phone || b.guest_phone || 'Not provided',
    suite_name: b.room?.name || b.suite_name || 'Suite',
    booking_reference: b.bookingReference || b.booking_reference || b.id,
    total_price: Number(b.totalPrice ?? b.total_price ?? 0),
    payment_status: b.paymentStatus || b.payment_status || 'pending',
    check_in: b.checkIn ? new Date(b.checkIn).toLocaleDateString('en-KE') : b.check_in || '—',
    check_out: b.checkOut ? new Date(b.checkOut).toLocaleDateString('en-KE') : b.check_out || '—',
});

const Bookings = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [sending, setSending] = useState(false);
    const [confirmingOffline, setConfirmingOffline] = useState(false);
    const [filters, setFilters] = useState({ status: '', search: '', date_from: null });

    useEffect(() => { fetchBookings(); }, [filters]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const apiFilters = {
                ...(filters.status && { status: filters.status }),
                ...(filters.search && { search: filters.search }),
                ...(filters.date_from && { date_from: filters.date_from.toISOString().split('T')[0] }),
            };
            const response = await dashboardService.getAllBookings(apiFilters);
            if (response.success) {
                setData((Array.isArray(response.data) ? response.data : []).map(normalise));
            } else throw new Error(response.error);
        } catch (error) {
            setData([]);
            notifications.show({ title: 'Error loading bookings', message: error.message, color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await dashboardService.updateBookingStatus(id, { status: newStatus });
            if (response.success) {
                notifications.show({ title: 'Updated', message: `Status changed to ${newStatus}`, color: 'green' });
                fetchBookings();
                if (selectedBooking?.id === id) setSelectedBooking(prev => ({ ...prev, status: newStatus }));
            } else throw new Error(response.error);
        } catch (error) {
            notifications.show({ title: 'Error', message: error.message, color: 'red' });
        }
    };

    const handleConfirmOffline = async () => {
        if (!selectedBooking) return;
        setConfirmingOffline(true);
        try {
            const response = await dashboardService.updateBookingStatus(selectedBooking.id, {
                status: 'confirmed',
                paymentStatus: 'paid'
            });
            if (response.success) {
                notifications.show({ title: 'Payment Confirmed', message: 'Booking is now marked as Paid & Confirmed', color: 'green' });
                fetchBookings();
                setSelectedBooking(prev => ({ ...prev, status: 'confirmed', payment_status: 'paid' }));
            } else throw new Error(response.error);
        } catch (error) {
            notifications.show({ title: 'Update failed', message: error.message, color: 'red' });
        } finally {
            setConfirmingOffline(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedBooking) return;
        if (!window.confirm(`Delete booking #${selectedBooking.booking_reference}? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await api.delete(`/bookings/${selectedBooking.id}`);
            notifications.show({ title: 'Deleted', message: 'Booking record removed', color: 'orange' });
            setShowDetails(false);
            fetchBookings();
        } catch (error) {
            notifications.show({ title: 'Delete failed', message: error.response?.data?.message || error.message, color: 'red' });
        } finally {
            setDeleting(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!selectedBooking) return;
        const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
        const url = `${apiBase}/bookings/${selectedBooking.id}/invoice/pdf?token=${token}`;
        notifications.show({ title: 'Generating PDF…', message: 'Please wait while we build your invoice.', color: 'blue', loading: true, id: 'invoice-dl' });
        try {
            const resp = await fetch(url);
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({ message: 'PDF generation failed' }));
                throw new Error(err.message);
            }
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `NordenSuites-Invoice-${selectedBooking.booking_reference || selectedBooking.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            notifications.update({ id: 'invoice-dl', title: 'Invoice Downloaded', message: 'PDF saved to your downloads folder.', color: 'green', loading: false });
        } catch (err) {
            notifications.update({ id: 'invoice-dl', title: 'Download Failed', message: err.message, color: 'red', loading: false });
        }
    };

    const handleSendInvoice = async () => {
        if (!selectedBooking) return;
        const guestEmail = selectedBooking.guest_email;
        if (!guestEmail) {
            notifications.show({ title: 'No Email', message: 'This guest has no email address on record.', color: 'orange' });
            return;
        }
        setSending(true);
        try {
            const resp = await api.post(`/bookings/${selectedBooking.id}/invoice/send`);
            if (resp.data?.success) {
                notifications.show({ title: 'Invoice Sent ✉️', message: `Invoice emailed to ${guestEmail}`, color: 'green' });
            } else {
                throw new Error(resp.data?.message || 'Failed to send invoice');
            }
        } catch (err) {
            notifications.show({ title: 'Send Failed', message: err.response?.data?.message || error.message, color: 'red' });
        } finally {
            setSending(false);
        }
    };

    const stats = useMemo(() => {
        const list = Array.isArray(data) ? data : [];
        return {
            total: list.length,
            confirmed: list.filter(b => b.status === 'confirmed').length,
            pending: list.filter(b => b.status === 'pending').length,
            revenue: list.reduce((acc, b) => acc + (b.total_price || 0), 0),
        };
    }, [data]);

    const openDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetails(true);
    };

    const rows = data.map((booking) => (
        <Table.Tr
            key={booking.id}
            onClick={() => openDetails(booking)}
            style={{ cursor: 'pointer' }}
            className="hover:bg-slate-50 transition-all border-b border-slate-100"
        >
            <Table.Td>
                <Group gap="sm">
                    <Avatar color="indigo" radius="md" variant="light">{(booking.guest_name || 'G').charAt(0)}</Avatar>
                    <div>
                        <Text fz="sm" fw={600}>{booking.guest_name}</Text>
                        <Text c="dimmed" fz="xs">{booking.guest_email}</Text>
                    </div>
                </Group>
            </Table.Td>
            <Table.Td>
                <Stack gap={0}>
                    <Text fz="sm" fw={500}>{booking.suite_name}</Text>
                    <Text c="dimmed" fz="xs">Ref: {booking.booking_reference}</Text>
                </Stack>
            </Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <Stack gap={0}>
                        <Text fz="xs" fw={700} c="dimmed">IN</Text>
                        <Text fz="sm">{booking.check_in}</Text>
                    </Stack>
                    <IconChevronRight size={14} color="#d1d5db" />
                    <Stack gap={0}>
                        <Text fz="xs" fw={700} c="dimmed">OUT</Text>
                        <Text fz="sm">{booking.check_out}</Text>
                    </Stack>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge color={statusColors[booking.status] || 'gray'} variant="dot">
                    {(booking.status || 'unknown').replace('_', ' ')}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Badge color={paymentColors[booking.payment_status] || 'gray'} variant="light">
                    {booking.payment_status}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text fw={800} fz="sm">KES {booking.total_price.toLocaleString('en-KE')}</Text>
            </Table.Td>
            <Table.Td onClick={(e) => e.stopPropagation()}>
                <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray"><IconDots size={18} /></ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />} onClick={() => openDetails(booking)}>View Details</Menu.Item>
                        <Divider />
                        {booking.status !== 'confirmed' && (
                            <Menu.Item leftSection={<IconCheck size={14} color="green" />} onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>Confirm</Menu.Item>
                        )}
                        {booking.status === 'confirmed' && (
                            <Menu.Item leftSection={<IconCheck size={14} color="blue" />} onClick={() => handleStatusUpdate(booking.id, 'checked_out')}>Check Out</Menu.Item>
                        )}
                        {booking.status !== 'cancelled' && (
                            <Menu.Item leftSection={<IconX size={14} color="red" />} color="red" onClick={() => handleStatusUpdate(booking.id, 'cancelled')}>Cancel</Menu.Item>
                        )}
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
        </Table.Tr>
    ));

    if (showDetails && selectedBooking) {
        const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
        const previewUrl = `${apiBase}/bookings/${selectedBooking.id}/invoice?token=${token}`;

        return (
            <Stack gap="xl" p={0}>
                {/* Header with back button */}
                <Group justify="space-between" align="center" py="md" px="lg" style={{ borderBottom: '1px solid #eee', background: '#fff' }}>
                    <Group>
                        <ActionIcon variant="subtle" size="lg" onClick={() => setShowDetails(false)}>
                            <IconArrowLeft size={24} />
                        </ActionIcon>
                        <Box>
                            <Title order={3}>Booking details</Title>
                            <Text fz="xs" c="dimmed" fw={700}>REF: {selectedBooking.booking_reference}</Text>
                        </Box>
                    </Group>
                    <Group>
                        <Button variant="light" color="red" leftSection={<IconTrash size={16} />} loading={deleting} onClick={handleDelete}>
                            Delete Reservation
                        </Button>
                        <Button variant="filled" color="blue" leftSection={<IconPrinter size={16} />} onClick={handleDownloadInvoice}>
                            Print Invoice
                        </Button>
                    </Group>
                </Group>

                <Container size="xl" w="100%" px="lg" pb="xl">
                    <Grid gutter="xl">
                        {/* Left Side: Booking Info */}
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Stack gap="lg">
                                {/* Status Card */}
                                <Card padding="lg" radius="md" withBorder>
                                    <Text fw={700} fz="xs" mb="lg" tt="uppercase" c="dimmed">Booking Status</Text>
                                    <Group grow gap="xl">
                                        <Stack gap={4}>
                                            <Text fz="xs" c="dimmed">Reservation</Text>
                                            <Badge size="lg" color={statusColors[selectedBooking.status] || 'gray'} variant="filled">
                                                {selectedBooking.status.toUpperCase()}
                                            </Badge>
                                        </Stack>
                                        <Stack gap={4}>
                                            <Text fz="xs" c="dimmed">Payment</Text>
                                            <Badge size="lg" color={paymentColors[selectedBooking.payment_status] || 'gray'} variant="light">
                                                {selectedBooking.payment_status.toUpperCase()}
                                            </Badge>
                                        </Stack>
                                    </Group>

                                    {selectedBooking.payment_status !== 'paid' && (
                                        <Button
                                            fullWidth
                                            mt="xl"
                                            color="green"
                                            leftSection={<IconCheck size={18} />}
                                            onClick={handleConfirmOffline}
                                            loading={confirmingOffline}
                                        >
                                            Confirm Payment Offline
                                        </Button>
                                    )}
                                </Card>

                                {/* Guest Card */}
                                <Card padding="lg" radius="md" withBorder>
                                    <Text fw={700} fz="xs" mb="lg" tt="uppercase" c="dimmed">Guest Information</Text>
                                    <Group gap="lg" align="flex-start" mb="xl">
                                        <Avatar size="xl" radius="md" color="blue" src={null}>{(selectedBooking.guest_name || 'G').charAt(0)}</Avatar>
                                        <Box>
                                            <Text fz="lg" fw={700}>{selectedBooking.guest_name}</Text>
                                            <Text c="dimmed" fz="sm" mb="xs">{selectedBooking.guest_email}</Text>
                                            <Badge variant="dot" color="blue">Primary Guest</Badge>
                                        </Box>
                                    </Group>

                                    <Stack gap="sm">
                                        <Group>
                                            <ThemeIcon size="sm" variant="light" color="gray"><IconMail size={14} /></ThemeIcon>
                                            <Text fz="sm">{selectedBooking.guest_email}</Text>
                                        </Group>
                                        <Group>
                                            <ThemeIcon size="sm" variant="light" color="gray"><IconPhone size={14} /></ThemeIcon>
                                            <Text fz="sm">{selectedBooking.guest_phone}</Text>
                                        </Group>
                                    </Stack>
                                </Card>

                                {/* Reservation Card */}
                                <Card padding="lg" radius="md" withBorder>
                                    <Text fw={700} fz="xs" mb="lg" tt="uppercase" c="dimmed">Reservation Details</Text>
                                    <Stack gap="md">
                                        <Group justify="space-between">
                                            <Group gap="sm">
                                                <ThemeIcon variant="light" color="blue" size="md"><IconHome size={18} /></ThemeIcon>
                                                <Text fw={600}>{selectedBooking.suite_name}</Text>
                                            </Group>
                                            <Text fw={700} c="blue">KES {selectedBooking.total_price.toLocaleString()}</Text>
                                        </Group>

                                        <Divider style={{ opacity: 0.5 }} />

                                        <SimpleGrid cols={2}>
                                            <Box>
                                                <Text fz="xs" c="dimmed" fw={700} tt="uppercase">Check-In</Text>
                                                <Text fw={600}>{selectedBooking.check_in}</Text>
                                            </Box>
                                            <Box>
                                                <Text fz="xs" c="dimmed" fw={700} tt="uppercase">Check-Out</Text>
                                                <Text fw={600}>{selectedBooking.check_out}</Text>
                                            </Box>
                                        </SimpleGrid>

                                        <Box mt="md">
                                            <Button
                                                fullWidth
                                                variant="light"
                                                color="indigo"
                                                leftSection={<IconSend size={16} />}
                                                loading={sending}
                                                onClick={handleSendInvoice}
                                                disabled={!selectedBooking.guest_email}
                                            >
                                                Email Invoice to Guest
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Stack>
                        </Grid.Col>

                        {/* Right Side: Invoice Preview */}
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Card padding={0} radius="md" withBorder h="100%" style={{ minHeight: '700px', display: 'flex', flexDirection: 'column' }}>
                                <Group px="lg" py="sm" justify="space-between" style={{ borderBottom: '1px solid #eee', background: '#fcfcfc' }}>
                                    <Group gap="sm">
                                        <IconReceipt2 size={20} color="gray" />
                                        <Text fw={700} fz="sm">Invoice Draft / Preview</Text>
                                    </Group>
                                    <Badge variant="outline">Live Preview</Badge>
                                </Group>
                                <Box style={{ flex: 1, position: 'relative' }}>
                                    <iframe
                                        src={previewUrl}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            border: 'none',
                                            background: '#fff'
                                        }}
                                        title="Invoice Preview"
                                    />
                                </Box>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Container>
            </Stack>
        );
    }

    return (
        <Stack gap="xl" p={2}>
            <Group justify="space-between">
                <Box>
                    <Text fz={28} fw={900} style={{ letterSpacing: '-0.5px' }}>Reservations</Text>
                    <Text fz="sm" c="dimmed">Monitor and manage all apartment bookings across your property.</Text>
                </Box>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} gap="lg">
                {[
                    { label: 'All Bookings', value: stats.total, color: 'blue', icon: IconCalendarEvent, badge: 'Total' },
                    { label: 'Pending Approval', value: stats.pending, color: 'yellow', icon: IconClock, badge: 'Pending' },
                    { label: 'Confirmed Stays', value: stats.confirmed, color: 'green', icon: IconCheck, badge: 'Confirmed' },
                    { label: 'Total Revenue', value: `KES ${Math.round(stats.revenue).toLocaleString('en-KE')}`, color: 'violet', icon: IconCreditCard, badge: 'Gross' },
                ].map((s) => (
                    <Card key={s.label} shadow="sm" padding="lg" radius="md" withBorder style={{ borderLeftWidth: 4, borderLeftColor: `var(--mantine-color-${s.color}-6)` }}>
                        <Group justify="space-between">
                            <ThemeIcon color={s.color} variant="light" size="xl" radius="md"><s.icon size={24} /></ThemeIcon>
                            <Badge variant="light" color={s.color}>{s.badge}</Badge>
                        </Group>
                        <Text fz="xs" c="dimmed" fw={700} tt="uppercase" mt="md">{s.label}</Text>
                        <Text fz="xl" fw={900}>{s.value}</Text>
                    </Card>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Paper shadow="sm" radius="md" p="md" withBorder>
                <Group align="flex-end">
                    <TextInput
                        placeholder="Search by name, email, or suite..."
                        leftSection={<IconSearch size={16} />}
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        style={{ flex: 1 }}
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
                            { value: 'cancelled', label: 'Cancelled' },
                        ]}
                        value={filters.status}
                        onChange={(val) => setFilters(prev => ({ ...prev, status: val || '' }))}
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

            {/* Table */}
            <Card shadow="sm" radius="md" withBorder padding={0}>
                <ScrollArea h={loading ? 300 : 'auto'}>
                    {loading ? (
                        <Center h={300}><Loader type="bars" /></Center>
                    ) : rows.length === 0 ? (
                        <Center h={300}>
                            <Stack align="center" gap="xs">
                                <IconSearch size={48} stroke={1.5} opacity={0.3} />
                                <Text fw={600} c="dimmed">No reservations found</Text>
                                <Button variant="subtle" size="xs" onClick={() => setFilters({ status: '', search: '', date_from: null })}>Reset filters</Button>
                            </Stack>
                        </Center>
                    ) : (
                        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
                            <Table.Thead style={{ background: '#f8fafc' }}>
                                <Table.Tr>
                                    <Table.Th>GUEST</Table.Th>
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
        </Stack>
    );
};

export default Bookings;
