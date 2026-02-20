import React, { useState, useEffect } from 'react';
import {
    Table,
    ScrollArea,
    UnstyledButton,
    Group,
    Text,
    Center,
    TextInput,
    rem,
    Badge,
    ActionIcon,
    Menu,
    Modal,
    Stack,
    Divider,
    Button,
    Textarea,
    Box,
    Paper,
    Title
} from '@mantine/core';
import {
    IconSelector,
    IconChevronDown,
    IconChevronUp,
    IconSearch,
    IconDots,
    IconTrash,
    IconEye,
    IconMail,
    IconCheck,
    IconCircleCheck
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [viewModalOpened, setViewModalOpened] = useState(false);
    const [reply, setReply] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/messages.php`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to load messages',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/messages.php?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const result = await response.json();
            if (result.success) {
                fetchMessages();
                if (viewModalOpened && selectedMessage?.id === id) {
                    setSelectedMessage({ ...selectedMessage, status });
                }
            }
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to update status', color: 'red' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/messages.php?id=${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                fetchMessages();
                notifications.show({ title: 'Deleted', message: 'Message removed' });
            }
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to delete message', color: 'red' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'unread': return 'red';
            case 'read': return 'blue';
            case 'replied': return 'green';
            default: return 'gray';
        }
    };

    const filteredMessages = messages.filter((msg) =>
        msg.guest_name.toLowerCase().includes(search.toLowerCase()) ||
        msg.guest_email.toLowerCase().includes(search.toLowerCase()) ||
        msg.subject.toLowerCase().includes(search.toLowerCase())
    );

    const rows = filteredMessages.map((msg) => (
        <Table.Tr key={msg.id}>
            <Table.Td>
                <Text size="sm" fw={500}>{msg.guest_name}</Text>
                <Text size="xs" c="dimmed">{msg.guest_email}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{msg.subject}</Text>
            </Table.Td>
            <Table.Td>
                <Badge color={getStatusColor(msg.status || 'unread')} variant="light">
                    {(msg.status || 'unread').toUpperCase()}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="xs" c="dimmed">
                    {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString()}
                </Text>
            </Table.Td>
            <Table.Td>
                <Group gap={0} justify="flex-end">
                    <ActionIcon variant="subtle" color="gray" onClick={() => {
                        setSelectedMessage(msg);
                        setViewModalOpened(true);
                        if (msg.status === 'unread') handleStatusUpdate(msg.id, 'read');
                    }}>
                        <IconEye size="1.1rem" stroke={1.5} />
                    </ActionIcon>
                    <Menu transitionProps={{ transition: 'pop' }} withArrow position="bottom-end">
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <IconDots size="1.1rem" stroke={1.5} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconCircleCheck size="1rem" stroke={1.5} />}
                                onClick={() => handleStatusUpdate(msg.id, 'replied')}
                            >
                                Mark as Replied
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconTrash size="1rem" stroke={1.5} />}
                                color="red"
                                onClick={() => handleDelete(msg.id)}
                            >
                                Delete Message
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Box>
            <Group justify="space-between" mb="xl">
                <Box>
                    <Title order={2} className="text-gray-900 dark:text-white font-serif">Guest Inquiries</Title>
                    <Text size="sm" c="dimmed">Manage and respond to messages from the contact page</Text>
                </Box>
                <TextInput
                    placeholder="Search messages..."
                    leftSection={<IconSearch size="1.1rem" stroke={1.5} />}
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    radius="md"
                    w={300}
                />
            </Group>

            <Paper p="md" radius="md" withBorder>
                <ScrollArea h={600} onScrollPositionChange={({ y }) => { }}>
                    <Table verticalSpacing="sm" highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Guest</Table.Th>
                                <Table.Th>Subject</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Date</Table.Th>
                                <Table.Th />
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {loading ? (
                                <Table.Tr><Table.Td colSpan={5}><Center py="xl"><Text>Loading inquiries...</Text></Center></Table.Td></Table.Tr>
                            ) : rows.length > 0 ? (
                                rows
                            ) : (
                                <Table.Tr><Table.Td colSpan={5}><Center py="xl"><Text c="dimmed">No messages found</Text></Center></Table.Td></Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Paper>

            <Modal
                opened={viewModalOpened}
                onClose={() => setViewModalOpened(false)}
                title={<Text fw={700} size="lg">Message Details</Text>}
                size="lg"
                radius="md"
            >
                {selectedMessage && (
                    <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                            <Box>
                                <Text size="sm" fw={700} mb={4}>From:</Text>
                                <Text size="md">{selectedMessage.guest_name} ({selectedMessage.guest_email})</Text>
                            </Box>
                            <Badge color={getStatusColor(selectedMessage.status)} variant="filled">
                                {selectedMessage.status.toUpperCase()}
                            </Badge>
                        </Group>

                        <Box>
                            <Text size="sm" fw={700} mb={4}>Subject:</Text>
                            <Text size="md" fw={600}>{selectedMessage.subject}</Text>
                        </Box>

                        <Divider />

                        <Box>
                            <Text size="sm" fw={700} mb={4}>Message:</Text>
                            <Paper p="md" bg="gray.50" withBorder radius="md">
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</Text>
                            </Paper>
                        </Box>

                        <Box>
                            <Text size="sm" fw={700} mb={4}>Respond:</Text>
                            <Textarea
                                placeholder="Write your response here..."
                                minRows={4}
                                value={reply}
                                onChange={(e) => setReply(e.currentTarget.value)}
                                radius="md"
                            />
                            <Group justify="flex-end" mt="md">
                                <Button
                                    variant="light"
                                    color="blue"
                                    leftSection={<IconMail size="1.2rem" />}
                                    onClick={() => {
                                        window.open(`mailto:${selectedMessage.guest_email}?subject=Re: ${selectedMessage.subject}&body=${encodeURIComponent(reply)}`);
                                        handleStatusUpdate(selectedMessage.id, 'replied');
                                        setViewModalOpened(false);
                                        setReply('');
                                    }}
                                >
                                    Send Email
                                </Button>
                            </Group>
                        </Box>
                    </Stack>
                )}
            </Modal>
        </Box>
    );
};

export default Messages;
