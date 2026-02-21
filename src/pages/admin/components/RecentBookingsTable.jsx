import React from 'react';
import { Paper, Table, Text, Group, Badge, Avatar, Anchor, Stack } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

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

export function RecentBookingsTable({ data }) {
    const navigate = useNavigate();

    if (!data || data.length === 0) {
        return (
            <Paper withBorder p="xl" radius="lg">
                <Group justify="space-between" mb="xl">
                    <Box>
                        <Text size="lg" fw={800}>Recent Bookings</Text>
                        <Text size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>Latest Activity</Text>
                    </Box>
                </Group>
                <Stack align="center" py="xl" gap="sm">
                    <IconCalendar size={40} opacity={0.3} />
                    <Text c="dimmed" fz="sm">No bookings yet. They will appear here once guests start booking.</Text>
                </Stack>
            </Paper>
        );
    }

    const rows = data.map((booking) => {
        const initials = (booking.guest_name || 'G').charAt(0).toUpperCase();
        return (
            <Table.Tr key={booking.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/bookings')}>
                <Table.Td>
                    <Group gap="sm">
                        <Avatar color="indigo" radius="xl" size="md">{initials}</Avatar>
                        <div>
                            <Text fz="sm" fw={600}>{booking.guest_name || 'Guest'}</Text>
                            <Text c="dimmed" fz="xs">{booking.guest_email || '—'}</Text>
                        </div>
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Text fz="sm" fw={500}>{booking.suite_name || 'Room'}</Text>
                    {booking.booking_reference && (
                        <Text c="dimmed" fz="xs">#{booking.booking_reference}</Text>
                    )}
                </Table.Td>
                <Table.Td>
                    <Text fz="sm">{booking.check_in}</Text>
                    <Text c="dimmed" fz="xs">→ {booking.check_out}</Text>
                </Table.Td>
                <Table.Td>
                    <Badge color={statusColors[booking.status] || 'gray'} variant="light" radius="sm">
                        {booking.status}
                    </Badge>
                </Table.Td>
                <Table.Td>
                    <Badge color={paymentColors[booking.payment_status] || 'gray'} variant="dot" radius="sm">
                        {booking.payment_status || 'pending'}
                    </Badge>
                </Table.Td>
                <Table.Td>
                    <Text fw={700} fz="sm">KES {Number(booking.total_price || 0).toLocaleString('en-KE')}</Text>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Paper withBorder p="xl" radius="lg">
            <Group justify="space-between" mb="xl">
                <div>
                    <Text size="lg" fw={800}>Recent Bookings</Text>
                    <Text size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>Latest Activity</Text>
                </div>
                <Anchor fz="sm" fw={600} onClick={() => navigate('/admin/bookings')} style={{ cursor: 'pointer' }}>
                    View all →
                </Anchor>
            </Group>

            <Table verticalSpacing="md" highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Guest</Table.Th>
                        <Table.Th>Suite</Table.Th>
                        <Table.Th>Dates</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Payment</Table.Th>
                        <Table.Th>Amount</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Paper>
    );
}
