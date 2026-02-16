import React from 'react';
import {
    Paper,
    Table,
    Text,
    Group,
    Badge,
    ActionIcon,
    Avatar,
    Menu
} from '@mantine/core';
import {
    IconDots,
    IconEye,
    IconEdit,
    IconTrash
} from '@tabler/icons-react';

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
    if (!data || data.length === 0) {
        return (
            <Paper withBorder p="md" radius="md" className="h-[400px] flex items-center justify-center">
                <Text c="dimmed">No recent bookings found.</Text>
            </Paper>
        );
    }

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
                    KES {Number(booking.total_price).toLocaleString()}
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
                        <Menu.Item leftSection={<IconEye style={{ width: 14, height: 14 }} />}>
                            View Details
                        </Menu.Item>
                        <Menu.Item leftSection={<IconEdit style={{ width: 14, height: 14 }} />}>
                            Edit Booking
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconTrash style={{ width: 14, height: 14 }} />}
                            color="red"
                        >
                            Cancel Booking
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="md">
                <div>
                    <Text size="lg" fw={700} className="text-gray-800 dark:text-gray-100">Recent Bookings</Text>
                    <Text size="xs" c="dimmed" className="uppercase tracking-wider">Latest Activity</Text>
                </div>
            </Group>

            <Table verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Guest</Table.Th>
                        <Table.Th>Suite</Table.Th>
                        <Table.Th>Dates</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Payment</Table.Th>
                        <Table.Th>Amount</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
