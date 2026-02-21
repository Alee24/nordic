import React, { useState, useEffect } from 'react';
import {
    Paper, Text, Group, Button, Stack, SimpleGrid, Card, Image,
    Badge, ActionIcon, Loader, Center, TextInput, Select, Box, Divider, Modal,
    NumberInput, Textarea, Switch
} from '@mantine/core';
import {
    IconPlus, IconSearch, IconBed, IconUsers, IconTrash, IconEdit,
    IconAdjustmentsHorizontal, IconPhoto, IconWifi, IconCheck
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { dashboardService } from '../../services/dashboardService';

const STATUS_COLORS = {
    available: 'green',
    occupied: 'blue',
    maintenance: 'orange',
    cleaning: 'yellow',
};

const ROOM_TYPES = [
    { value: 'studio', label: 'Studio' },
    { value: 'suite', label: 'Suite' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'family', label: 'Family' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'standard', label: 'Standard' },
];

const STATUS_OPTIONS = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'cleaning', label: 'Cleaning' },
];

const emptyForm = {
    name: '',
    type: 'suite',
    price: 0,
    description: '',
    imageUrl: '',
    status: 'available',
};

const Rooms = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [opened, { open, close }] = useDisclosure(false);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => { fetchRooms(); }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getRoomStatus();
            if (response.success) {
                setRooms(response.data || []);
            } else {
                notifications.show({ title: 'Error', message: response.error, color: 'red' });
            }
        } catch (error) {
            notifications.show({ title: 'Error', message: error.message, color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setSelectedRoom(null);
        setIsEdit(false);
        setFormData(emptyForm);
        open();
    };

    const openEdit = (room) => {
        setSelectedRoom(room);
        setIsEdit(true);
        setFormData({
            name: room.name || '',
            type: room.type || 'suite',
            price: Number(room.price) || 0,
            description: room.description || '',
            imageUrl: room.imageUrl || '',
            status: room.status || 'available',
        });
        open();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            notifications.show({ title: 'Validation', message: 'Room name is required', color: 'orange' });
            return;
        }
        if (!formData.price || formData.price <= 0) {
            notifications.show({ title: 'Validation', message: 'Price must be greater than 0', color: 'orange' });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                type: formData.type,
                price: formData.price,
                description: formData.description.trim(),
                imageUrl: formData.imageUrl.trim() || null,
                status: formData.status,
            };
            const response = isEdit
                ? await dashboardService.updateRoom(selectedRoom.id, payload)
                : await dashboardService.addRoom(payload);

            if (response.success) {
                notifications.show({
                    title: isEdit ? 'Room Updated' : 'Room Created',
                    message: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully`,
                    color: 'green',
                    icon: <IconCheck size={16} />,
                });
                close();
                fetchRooms();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            notifications.show({ title: 'Error', message: error.message, color: 'red' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete room "${name}"? This cannot be undone.`)) return;
        try {
            const response = await dashboardService.deleteRoom(id);
            if (response.success) {
                notifications.show({ title: 'Deleted', message: `${name} removed`, color: 'orange' });
                fetchRooms();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            notifications.show({ title: 'Error', message: error.message, color: 'red' });
        }
    };

    const filteredRooms = rooms
        .filter(room => {
            const q = search.toLowerCase();
            return (
                (room.name || '').toLowerCase().includes(q) ||
                (room.type || '').toLowerCase().includes(q) ||
                (room.description || '').toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
            if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            return 0;
        });

    return (
        <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between" align="end">
                <Box>
                    <Group gap="xs" mb={4}>
                        <IconBed size={28} color="#2563eb" />
                        <Text size="2xl" fw={900} style={{ letterSpacing: '-0.5px' }}>Room Inventory</Text>
                    </Group>
                    <Text size="sm" c="dimmed">Manage suites, pricing, and availability.</Text>
                </Box>
                <Button
                    size="md"
                    radius="md"
                    leftSection={<IconPlus size={18} />}
                    color="blue"
                    onClick={openAdd}
                >
                    Add New Room
                </Button>
            </Group>

            {/* Search & Filter */}
            <Paper p="md" radius="lg" withBorder>
                <Group>
                    <TextInput
                        placeholder="Search by name, type..."
                        leftSection={<IconSearch size={16} />}
                        style={{ flex: 1 }}
                        radius="md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Select
                        placeholder="Sort by"
                        leftSection={<IconAdjustmentsHorizontal size={16} />}
                        data={[
                            { value: 'name', label: 'Name' },
                            { value: 'price-low', label: 'Price: Lowest' },
                            { value: 'price-high', label: 'Price: Highest' },
                        ]}
                        value={sortBy}
                        onChange={setSortBy}
                        radius="md"
                        w={180}
                    />
                </Group>
            </Paper>

            {/* Rooms Grid */}
            {loading ? (
                <Center h={400}>
                    <Stack align="center">
                        <Loader size="xl" type="dots" />
                        <Text size="sm" c="dimmed">Loading rooms...</Text>
                    </Stack>
                </Center>
            ) : filteredRooms.length === 0 ? (
                <Paper p={60} withBorder radius="xl" style={{ borderStyle: 'dashed', borderWidth: 2 }}>
                    <Center>
                        <Stack align="center" gap="md">
                            <Box style={{ padding: 16, background: '#eff6ff', borderRadius: '50%' }}>
                                <IconBed size={48} color="#93c5fd" />
                            </Box>
                            <Box style={{ textAlign: 'center' }}>
                                <Text fw={800} size="xl">
                                    {search ? 'No matching rooms' : 'No rooms yet'}
                                </Text>
                                <Text size="sm" c="dimmed" mt={4}>
                                    {search ? 'Try a different search term.' : 'Click "Add New Room" to create your first room.'}
                                </Text>
                            </Box>
                            {search && (
                                <Button variant="light" radius="md" onClick={() => setSearch('')}>
                                    Clear search
                                </Button>
                            )}
                            {!search && (
                                <Button radius="md" color="blue" leftSection={<IconPlus size={16} />} onClick={openAdd}>
                                    Add New Room
                                </Button>
                            )}
                        </Stack>
                    </Center>
                </Paper>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                    {filteredRooms.map((room) => (
                        <Card key={room.id} shadow="md" padding="lg" radius="lg" withBorder>
                            <Card.Section style={{ position: 'relative', overflow: 'hidden' }}>
                                <Image
                                    src={room.imageUrl || 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=2000'}
                                    height={200}
                                    alt={room.name}
                                    style={{ objectFit: 'cover' }}
                                />
                                <Box style={{ position: 'absolute', top: 10, right: 10 }}>
                                    <Badge size="lg" variant="filled" color="dark">
                                        KES {Number(room.price).toLocaleString()}
                                    </Badge>
                                </Box>
                                <Box style={{ position: 'absolute', top: 10, left: 10 }}>
                                    <Badge
                                        size="sm"
                                        variant="filled"
                                        color={STATUS_COLORS[room.status] || 'gray'}
                                    >
                                        {(room.status || 'unknown').toUpperCase()}
                                    </Badge>
                                </Box>
                            </Card.Section>

                            <Stack gap="xs" mt="md">
                                <Group justify="space-between" wrap="nowrap">
                                    <Text fw={700} size="lg" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {room.name}
                                    </Text>
                                    <Badge color="blue" variant="light" size="sm">
                                        {(room.type || 'suite').toUpperCase()}
                                    </Badge>
                                </Group>

                                <Text size="sm" c="dimmed" lineClamp={2}>
                                    {room.description || 'No description provided.'}
                                </Text>

                                <Divider my="sm" variant="dashed" />

                                <Group gap="xs">
                                    <Button
                                        variant="light"
                                        color="blue"
                                        style={{ flex: 1 }}
                                        radius="md"
                                        size="sm"
                                        leftSection={<IconEdit size={15} />}
                                        onClick={() => openEdit(room)}
                                    >
                                        Edit
                                    </Button>
                                    <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        size="lg"
                                        radius="md"
                                        onClick={() => handleDelete(room.id, room.name)}
                                    >
                                        <IconTrash size={17} />
                                    </ActionIcon>
                                </Group>
                            </Stack>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {/* Add / Edit Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title={<Text fw={700} size="lg">{isEdit ? 'Edit Room' : 'Add New Room'}</Text>}
                size="lg"
                radius="md"
                overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
            >
                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <TextInput
                            label="Room Name"
                            placeholder="e.g. Ocean View Suite 101"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />

                        <Group grow>
                            <Select
                                label="Room Type"
                                required
                                data={ROOM_TYPES}
                                value={formData.type}
                                onChange={(val) => setFormData({ ...formData, type: val })}
                            />
                            <Select
                                label="Status"
                                data={STATUS_OPTIONS}
                                value={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                            />
                        </Group>

                        <NumberInput
                            label="Price per Night (KES)"
                            placeholder="e.g. 12000"
                            required
                            min={0}
                            prefix="KES "
                            thousandSeparator=","
                            value={formData.price}
                            onChange={(val) => setFormData({ ...formData, price: val })}
                        />

                        <Textarea
                            label="Description"
                            placeholder="Describe the room..."
                            minRows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />

                        <TextInput
                            label="Image URL"
                            placeholder="https://..."
                            leftSection={<IconPhoto size={16} />}
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        />

                        {formData.imageUrl && (
                            <Image
                                src={formData.imageUrl}
                                height={160}
                                radius="md"
                                alt="Preview"
                                style={{ objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}

                        <Group justify="flex-end" mt="sm">
                            <Button variant="default" radius="md" onClick={close} disabled={saving}>
                                Cancel
                            </Button>
                            <Button type="submit" radius="md" color="blue" loading={saving}>
                                {isEdit ? 'Save Changes' : 'Create Room'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Stack>
    );
};

export default Rooms;
