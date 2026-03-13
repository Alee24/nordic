import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    Paper,
    Group,
    Stack,
    ActionIcon,
    Table,
    Badge,
    TextInput,
    Pagination,
    Loader,
    Button,
    Tooltip
} from '@mantine/core';
import { Mail, Search, Download, Trash, RefreshCw, UserCheck, UserX } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import api from '../../services/api';

const Subscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 15;

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/subscribers');
            if (data.success) {
                setSubscribers(data.data);
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to fetch subscribers',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const filtered = subscribers.filter(s =>
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const exportToCSV = () => {
        const headers = ['Email', 'Status', 'Date Joined'];
        const rows = filtered.map(s => [
            s.email,
            s.status,
            new Date(s.createdAt).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `nordic_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                <Group justify="space-between">
                    <div>
                        <Title order={2} className="text-theme-text font-serif">VIP Newsletter Subscribers</Title>
                        <Text c="dimmed" size="sm">Manage and export your community email list</Text>
                    </div>
                    <Group>
                        <Button
                            variant="light"
                            leftSection={<RefreshCw size={16} />}
                            onClick={fetchSubscribers}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="filled"
                            color="norden-gold.5"
                            leftSection={<Download size={16} />}
                            onClick={exportToCSV}
                            disabled={filtered.length === 0}
                        >
                            Export CSV
                        </Button>
                    </Group>
                </Group>

                <Paper p="md" radius="md" withBorder>
                    <Stack gap="md">
                        <TextInput
                            placeholder="Search by email..."
                            leftSection={<Search size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {loading ? (
                            <Group justify="center" py="xl">
                                <Loader size="md" />
                            </Group>
                        ) : filtered.length === 0 ? (
                            <Paper p="xl" bg="gray.0" radius="md" className="text-center">
                                <Text c="dimmed">No subscribers found</Text>
                            </Paper>
                        ) : (
                            <>
                                <Table striped highlightOnHover verticalSpacing="md">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Email Address</Table.Th>
                                            <Table.Th>Status</Table.Th>
                                            <Table.Th>Joined Date</Table.Th>
                                            <Table.Th>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {paginated.map((sub) => (
                                            <Table.Tr key={sub.id}>
                                                <Table.Td>
                                                    <Group gap="sm">
                                                        <Mail size={16} className="text-theme-accent" />
                                                        <Text fw={500}>{sub.email}</Text>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge
                                                        color={sub.status === 'active' ? 'green' : 'gray'}
                                                        variant="light"
                                                        leftSection={sub.status === 'active' ? <UserCheck size={12} /> : <UserX size={12} />}
                                                    >
                                                        {sub.status}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{new Date(sub.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        <Tooltip label="Coming soon: Manage status">
                                                            <ActionIcon variant="subtle" color="gray">
                                                                <Trash size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>

                                <Group justify="center" mt="md">
                                    <Pagination
                                        total={Math.ceil(filtered.length / itemsPerPage)}
                                        value={page}
                                        onChange={setPage}
                                        color="norden-gold.5"
                                    />
                                </Group>
                            </>
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
};

export default Subscribers;
