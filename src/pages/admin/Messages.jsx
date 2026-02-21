import React, { useState, useEffect } from 'react';
import {
    Box, Group, Text, Badge, ActionIcon, Modal, Stack, Divider,
    Button, Textarea, Paper, Title, TextInput, Table, ScrollArea,
    Center, Menu, Loader, Avatar, SimpleGrid, Card, ThemeIcon
} from '@mantine/core';
import {
    IconSearch, IconDots, IconTrash, IconEye, IconMail,
    IconCircleCheck, IconInbox, IconRefresh, IconClock,
    IconCheck, IconArchive, IconMessage
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../services/api';

const STATUS_COLORS = { unread: 'red', read: 'blue', replied: 'green', archived: 'gray' };

const Messages = ({ onUnreadChange }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [viewModalOpened, setViewModalOpened] = useState(false);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/messages');
            const data = Array.isArray(res.data?.data) ? res.data.data : [];
            setMessages(data);
            // Notify parent of unread count
            const unread = data.filter(m => m.status === 'unread').length;
            if (typeof onUnreadChange === 'function') onUnreadChange(unread);
        } catch (error) {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to load messages', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/messages/${id}`, { status });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
            if (selectedMessage?.id === id) setSelectedMessage(prev => ({ ...prev, status }));
            const updated = messages.map(m => m.id === id ? { ...m, status } : m);
            if (typeof onUnreadChange === 'function') {
                onUnreadChange(updated.filter(m => m.status === 'unread').length);
            }
        } catch (error) {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to update status', color: 'red' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this message permanently?')) return;
        try {
            await api.delete(`/messages/${id}`);
            setMessages(prev => prev.filter(m => m.id !== id));
            notifications.show({ title: 'Deleted', message: 'Message removed', color: 'orange' });
            if (viewModalOpened && selectedMessage?.id === id) setViewModalOpened(false);
        } catch (error) {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to delete', color: 'red' });
        }
    };

    const handleOpenMessage = (msg) => {
        setSelectedMessage(msg);
        setViewModalOpened(true);
        setReply('');
        if (msg.status === 'unread') handleStatusUpdate(msg.id, 'read');
    };

    const handleSendReply = async () => {
        if (!reply.trim()) return;
        setSending(true);
        try {
            // Send via mailto (opens email client) then mark as replied
            const mailLink = `mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Your Inquiry')}&body=${encodeURIComponent(reply)}`;
            window.open(mailLink);
            await handleStatusUpdate(selectedMessage.id, 'replied');
            notifications.show({ title: 'Reply Sent', message: 'Message marked as replied.', color: 'green' });
            setReply('');
            setViewModalOpened(false);
        } catch (_) {
        } finally {
            setSending(false);
        }
    };

    const stats = {
        total: messages.length,
        unread: messages.filter(m => m.status === 'unread').length,
        read: messages.filter(m => m.status === 'read').length,
        replied: messages.filter(m => m.status === 'replied').length,
    };

    const filtered = messages.filter(msg => {
        const matchSearch = (msg.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (msg.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (msg.subject || '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = activeFilter === 'all' || msg.status === activeFilter;
        return matchSearch && matchFilter;
    });

    return (
        <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between" align="end">
                <Box>
                    <Group gap="xs" mb={4}>
                        <IconMessage size={28} color="#2563eb" />
                        <Text size="2xl" fw={900} style={{ letterSpacing: '-0.5px' }}>Guest Inquiries</Text>
                        {stats.unread > 0 && <Badge color="red" size="lg">{stats.unread} NEW</Badge>}
                    </Group>
                    <Text size="sm" c="dimmed">Messages from the contact form. Reply and manage inquiries here.</Text>
                </Box>
                <ActionIcon variant="light" size="lg" radius="md" onClick={fetchMessages} title="Refresh">
                    <IconRefresh size={18} />
                </ActionIcon>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} gap="md">
                {[
                    { label: 'Total', value: stats.total, color: 'blue', icon: IconInbox, filter: 'all' },
                    { label: 'Unread', value: stats.unread, color: 'red', icon: IconClock, filter: 'unread' },
                    { label: 'Read', value: stats.read, color: 'blue', icon: IconEye, filter: 'read' },
                    { label: 'Replied', value: stats.replied, color: 'green', icon: IconCheck, filter: 'replied' },
                ].map((s) => (
                    <Card
                        key={s.label} shadow="xs" padding="md" radius="md" withBorder
                        onClick={() => setActiveFilter(s.filter)}
                        style={{
                            cursor: 'pointer',
                            borderColor: activeFilter === s.filter ? `var(--mantine-color-${s.color}-5)` : undefined,
                            borderWidth: activeFilter === s.filter ? 2 : 1,
                        }}
                    >
                        <Group justify="space-between">
                            <Text fz="xs" c="dimmed" fw={700} tt="uppercase">{s.label}</Text>
                            <ThemeIcon color={s.color} variant="light" size="sm" radius="md"><s.icon size={14} /></ThemeIcon>
                        </Group>
                        <Text fz="xl" fw={900} mt={4}>{s.value}</Text>
                    </Card>
                ))}
            </SimpleGrid>

            {/* Search */}
            <TextInput
                placeholder="Search by name, email or subject..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                radius="md"
            />

            {/* Table */}
            <Paper withBorder radius="md" padding={0} style={{ overflow: 'hidden' }}>
                <ScrollArea>
                    <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
                        <Table.Thead style={{ background: '#f8fafc' }}>
                            <Table.Tr>
                                <Table.Th>SENDER</Table.Th>
                                <Table.Th>SUBJECT</Table.Th>
                                <Table.Th>STATUS</Table.Th>
                                <Table.Th>DATE</Table.Th>
                                <Table.Th />
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {loading ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <Center py="xl"><Loader type="bars" /></Center>
                                    </Table.Td>
                                </Table.Tr>
                            ) : filtered.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <Center py="xl">
                                            <Stack align="center" gap="xs">
                                                <IconInbox size={48} stroke={1.2} opacity={0.3} />
                                                <Text c="dimmed" fw={600}>No messages found</Text>
                                            </Stack>
                                        </Center>
                                    </Table.Td>
                                </Table.Tr>
                            ) : filtered.map((msg) => (
                                <Table.Tr
                                    key={msg.id}
                                    onClick={() => handleOpenMessage(msg)}
                                    style={{
                                        cursor: 'pointer',
                                        fontWeight: msg.status === 'unread' ? 700 : 400,
                                        background: msg.status === 'unread' ? '#eff6ff' : undefined,
                                    }}
                                >
                                    <Table.Td>
                                        <Group gap="sm">
                                            <Avatar color="blue" radius="xl" size="sm">
                                                {(msg.name || 'G').charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Text fz="sm" fw={msg.status === 'unread' ? 700 : 500}>{msg.name}</Text>
                                                <Text fz="xs" c="dimmed">{msg.email}</Text>
                                            </Box>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fz="sm" lineClamp={1}>{msg.subject || '(no subject)'}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={STATUS_COLORS[msg.status] || 'gray'} variant="light">
                                            {(msg.status || 'unread').toUpperCase()}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fz="xs" c="dimmed">
                                            {new Date(msg.createdAt || msg.created_at).toLocaleDateString('en-KE', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td onClick={(e) => e.stopPropagation()}>
                                        <Menu shadow="md" position="bottom-end">
                                            <Menu.Target>
                                                <ActionIcon variant="subtle" color="gray"><IconDots size={16} /></ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleOpenMessage(msg)}>View</Menu.Item>
                                                <Menu.Item leftSection={<IconCircleCheck size={14} color="green" />} onClick={() => handleStatusUpdate(msg.id, 'replied')}>Mark Replied</Menu.Item>
                                                <Menu.Item leftSection={<IconArchive size={14} />} onClick={() => handleStatusUpdate(msg.id, 'archived')}>Archive</Menu.Item>
                                                <Divider />
                                                <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => handleDelete(msg.id)}>Delete</Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Paper>

            {/* Message Detail Modal */}
            <Modal
                opened={viewModalOpened}
                onClose={() => setViewModalOpened(false)}
                title={<Text fw={700} size="lg">Message Details</Text>}
                size="lg" radius="md"
                overlayProps={{ backgroundOpacity: 0.5, blur: 3 }}
            >
                {selectedMessage && (
                    <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                            <Box>
                                <Text fz="sm" c="dimmed" fw={600}>FROM</Text>
                                <Text fw={700}>{selectedMessage.name}</Text>
                                <Text fz="sm" c="blue">{selectedMessage.email}</Text>
                            </Box>
                            <Stack gap={4} align="flex-end">
                                <Badge color={STATUS_COLORS[selectedMessage.status]} variant="filled">
                                    {selectedMessage.status?.toUpperCase()}
                                </Badge>
                                <Text fz="xs" c="dimmed">
                                    {new Date(selectedMessage.createdAt || selectedMessage.created_at).toLocaleString('en-KE')}
                                </Text>
                            </Stack>
                        </Group>

                        <Box>
                            <Text fz="sm" fw={600} c="dimmed" mb={4}>SUBJECT</Text>
                            <Text fw={600}>{selectedMessage.subject || '(no subject)'}</Text>
                        </Box>

                        <Divider />

                        <Box>
                            <Text fz="sm" fw={600} c="dimmed" mb={8}>MESSAGE</Text>
                            <Paper p="md" style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                                <Text fz="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                    {selectedMessage.message}
                                </Text>
                            </Paper>
                        </Box>

                        <Divider label="Reply" labelPosition="center" />

                        <Textarea
                            placeholder={`Write your reply to ${selectedMessage.name}...`}
                            minRows={4}
                            value={reply}
                            onChange={(e) => setReply(e.currentTarget.value)}
                            radius="md"
                        />
                        <Group justify="space-between">
                            <Group gap="xs">
                                <Button variant="light" size="xs" color="orange"
                                    leftSection={<IconArchive size={14} />}
                                    onClick={() => { handleStatusUpdate(selectedMessage.id, 'archived'); setViewModalOpened(false); }}>
                                    Archive
                                </Button>
                                <Button variant="light" size="xs" color="red"
                                    leftSection={<IconTrash size={14} />}
                                    onClick={() => handleDelete(selectedMessage.id)}>
                                    Delete
                                </Button>
                            </Group>
                            <Button
                                color="blue"
                                leftSection={<IconMail size={16} />}
                                disabled={!reply.trim()}
                                loading={sending}
                                onClick={handleSendReply}
                            >
                                Send Email Reply
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </Stack>
    );
};

export default Messages;
