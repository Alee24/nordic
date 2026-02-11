import React, { useState } from 'react';
import {
    Paper,
    Text,
    Group,
    Stack,
    Table,
    Badge,
    ActionIcon,
    TextInput,
    Avatar,
    Box,
    Button,
    SimpleGrid,
    Card
} from '@mantine/core';
import {
    IconSearch,
    IconUsers,
    IconMail,
    IconPhone,
    IconCalendarEvent,
    IconDotsVertical,
    IconUserPlus
} from '@tabler/icons-react';

const mockGuests = [
    { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1 234 567 890', bookings: 4, lastStay: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 987 654 321', bookings: 2, lastStay: '2023-12-20', status: 'Active' },
    { id: 3, name: 'Robert Brown', email: 'robert@example.com', phone: '+1 555 123 456', bookings: 1, lastStay: '2024-02-01', status: 'Pending' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+1 444 888 999', bookings: 12, lastStay: '2024-02-08', status: 'Active' },
];

const Guests = () => {
    const [search, setSearch] = useState('');
    const [demoMode, setDemoMode] = useState(true);

    const filteredGuests = mockGuests.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.email.toLowerCase().includes(search.toLowerCase())
    );

    const rows = filteredGuests.map((guest) => (
        <Table.Tr key={guest.id}>
            <Table.Td>
                <Group gap="sm">
                    <Avatar color="blue" radius="xl">{guest.name.charAt(0)}</Avatar>
                    <Box>
                        <Text size="sm" fw={600}>{guest.name}</Text>
                        <Text size="xs" c="dimmed">ID: #{guest.id}</Text>
                    </Box>
                </Group>
            </Table.Td>
            <Table.Td>
                <Stack gap={0}>
                    <Group gap={4}>
                        <IconMail size={12} className="text-gray-400" />
                        <Text size="xs">{guest.email}</Text>
                    </Group>
                    <Group gap={4}>
                        <IconPhone size={12} className="text-gray-400" />
                        <Text size="xs">{guest.phone}</Text>
                    </Group>
                </Stack>
            </Table.Td>
            <Table.Td>
                <Badge variant="light" color="blue">{guest.bookings} stays</Badge>
            </Table.Td>
            <Table.Td>
                <Group gap={4}>
                    <IconCalendarEvent size={14} className="text-gray-400" />
                    <Text size="xs">{guest.lastStay}</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge color={guest.status === 'Active' ? 'green' : 'orange'} variant="dot">
                    {guest.status}
                </Badge>
            </Table.Td>
            <Table.Td>
                <ActionIcon variant="subtle" color="gray">
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Box>
                    <Text size="xl" fw={800}>Guest Directory</Text>
                    <Text size="sm" c="dimmed">Manage guest profiles and booking history.</Text>
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
                    <Button variant="filled" color="blue" leftSection={<IconUserPlus size={18} />}>
                        Register Guest
                    </Button>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                <Card withBorder radius="md" p="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Total Members</Text>
                        <IconUsers size={16} className="text-blue-500" />
                    </Group>
                    <Text size="xl" fw={900} mt="xs">1,248</Text>
                </Card>
                <Card withBorder radius="md" p="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Active This Month</Text>
                        <IconCalendarEvent size={16} className="text-green-500" />
                    </Group>
                    <Text size="xl" fw={900} mt="xs">156</Text>
                </Card>
                <Card withBorder radius="md" p="md">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">New Registrations</Text>
                        <IconUserPlus size={16} className="text-orange-500" />
                    </Group>
                    <Text size="xl" fw={900} mt="xs">24</Text>
                </Card>
            </SimpleGrid>

            <Paper withBorder radius="md">
                <Box p="md" borderBottom="1px solid #eee">
                    <TextInput
                        placeholder="Search guests by name or email..."
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        radius="md"
                    />
                </Box>
                <Table verticalSpacing="sm">
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>Guest</Table.Th>
                            <Table.Th>Contact</Table.Th>
                            <Table.Th>History</Table.Th>
                            <Table.Th>Last Visit</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th />
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
};

export default Guests;
