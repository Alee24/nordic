import React, { useState, useEffect, useRef } from 'react';
import {
    Paper, Text, Group, Button, Stack, SimpleGrid, Card, Image,
    Badge, ActionIcon, Loader, Center, TextInput, Select, Box, Divider, Modal,
    NumberInput, Textarea, AspectRatio
} from '@mantine/core';
import {
    IconPlus, IconSearch, IconBed, IconTrash, IconEdit,
    IconAdjustmentsHorizontal, IconPhoto, IconCheck, IconUpload, IconX
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { dashboardService } from '../../services/dashboardService';
import api from '../../services/api';

const STATUS_COLORS = {
    available: 'green', occupied: 'blue',
    maintenance: 'orange', cleaning: 'yellow',
};

const ROOM_TYPES = [
    { value: 'studio', label: 'Studio' }, { value: 'suite', label: 'Suite' },
    { value: 'penthouse', label: 'Penthouse' }, { value: 'family', label: 'Family' },
    { value: 'deluxe', label: 'Deluxe' }, { value: 'standard', label: 'Standard' },
];

const STATUS_OPTIONS = [
    { value: 'available', label: 'Available' }, { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' }, { value: 'cleaning', label: 'Cleaning' },
];

const FALLBACK = 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=800';

/**
 * Always returns a usable src for <img>.
 * - Relative paths (/uploads/...) → returned as-is (Apache Alias serves them)
 * - Old absolute URLs (https://nordensuites.com/uploads/...) → stripped to /uploads/...
 * - External URLs (Unsplash, etc.) → used as-is
 * - null/empty → FALLBACK
 */
const resolveImageUrl = (url) => {
    if (!url) return FALLBACK;
    // Already relative
    if (url.startsWith('/uploads/')) return url;
    // Old absolute URL from this domain — strip to relative path
    try {
        const parsed = new URL(url);
        if (parsed.pathname.startsWith('/uploads/')) return parsed.pathname;
    } catch (_) { /* not a full URL */ }
    // External or unknown — use as-is
    return url;
};

// Returns true if this url is a real uploaded image (not a fallback)
const isRealImage = (url) => {
    if (!url) return false;
    const resolved = resolveImageUrl(url);
    return resolved !== FALLBACK && resolved.startsWith('/uploads/');
};

const emptyForm = {
    name: '', type: 'suite', price: 0,
    description: '', imageUrl: '', status: 'available',
};

const Rooms = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [opened, { open, close }] = useDisclosure(false);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const fileInputRef = useRef(null);

    useEffect(() => { fetchRooms(); }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getRoomStatus();
            if (response.success) setRooms(response.data || []);
            else notifications.show({ title: 'Error', message: response.error, color: 'red' });
        } catch (error) {
            notifications.show({ title: 'Error', message: error.message, color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => { setSelectedRoom(null); setIsEdit(false); setFormData(emptyForm); open(); };
    const openEdit = (room) => {
        setSelectedRoom(room);
        setIsEdit(true);
        // Prefer imageUrl field; also check image_url snake_case variant from some API responses
        const img = room.imageUrl || room.image_url || room.photos?.[0] || '';
        setFormData({
            name: room.name || '', type: room.type || 'suite',
            price: Number(room.price) || 0, description: room.description || '',
            imageUrl: img, status: room.status || 'available',
        });
        open();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side format guard
        const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i;
        if (!allowed.test(file.type)) {
            notifications.show({ title: 'Invalid file', message: 'Only JPG, PNG, WEBP and GIF images are allowed.', color: 'red' });
            return;
        }

        setUploadingImage(true);
        try {
            const form = new FormData();
            form.append('image', file);
            // The api instance already injects the Authorization header via interceptor
            const res = await api.post('/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                const relUrl = res.data.data.url; // already a relative path like /uploads/room_xxx.jpg
                setFormData(prev => ({ ...prev, imageUrl: relUrl }));
                notifications.show({ title: 'Image Uploaded ✓', message: 'Image saved and ready.', color: 'green', icon: <IconCheck size={16} /> });
            } else {
                throw new Error(res.data.message || 'Upload failed');
            }
        } catch (err) {
            notifications.show({
                title: 'Upload Failed',
                message: err.response?.data?.message || err.message,
                color: 'red'
            });
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { notifications.show({ title: 'Validation', message: 'Room name is required', color: 'orange' }); return; }
        if (!formData.price || formData.price <= 0) { notifications.show({ title: 'Validation', message: 'Price must be greater than 0', color: 'orange' }); return; }
        setSaving(true);
        try {
            const payload = {
                name: formData.name.trim(), type: formData.type,
                price: formData.price, description: formData.description.trim(),
                imageUrl: formData.imageUrl || null, status: formData.status,
            };
            const response = isEdit
                ? await dashboardService.updateRoom(selectedRoom.id, payload)
                : await dashboardService.addRoom(payload);
            if (response.success) {
                notifications.show({ title: isEdit ? 'Room Updated' : 'Room Created', message: `${formData.name} saved successfully`, color: 'green' });
                close();
                fetchRooms();
            } else throw new Error(response.error);
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
            if (response.success) { notifications.show({ title: 'Deleted', message: `${name} removed`, color: 'orange' }); fetchRooms(); }
            else throw new Error(response.error);
        } catch (error) {
            notifications.show({ title: 'Error', message: error.message, color: 'red' });
        }
    };

    const filteredRooms = rooms
        .filter(r => {
            const q = search.toLowerCase();
            return (r.name || '').toLowerCase().includes(q) || (r.type || '').toLowerCase().includes(q);
        })
        .sort((a, b) => {
            if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
            if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
            return (a.name || '').localeCompare(b.name || '');
        });

    const previewSrc = formData.imageUrl ? resolveImageUrl(formData.imageUrl) : null;
    const hasRealPreview = previewSrc && previewSrc !== FALLBACK;

    return (
        <Stack gap="xl">
            {/* Header */}
            <Group justify="space-between" align="end">
                <Box>
                    <Group gap="xs" mb={4}><IconBed size={28} color="#2563eb" /><Text size="2xl" fw={900} style={{ letterSpacing: '-0.5px' }}>Room Inventory</Text></Group>
                    <Text size="sm" c="dimmed">Manage suites, pricing, and availability.</Text>
                </Box>
                <Button size="md" radius="md" leftSection={<IconPlus size={18} />} color="blue" onClick={openAdd}>Add New Room</Button>
            </Group>

            {/* Search & Filter */}
            <Paper p="md" radius="lg" withBorder>
                <Group>
                    <TextInput placeholder="Search by name, type..." leftSection={<IconSearch size={16} />}
                        style={{ flex: 1 }} radius="md" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Select placeholder="Sort by" leftSection={<IconAdjustmentsHorizontal size={16} />}
                        data={[{ value: 'name', label: 'Name' }, { value: 'price-low', label: 'Price: Lowest' }, { value: 'price-high', label: 'Price: Highest' }]}
                        value={sortBy} onChange={setSortBy} radius="md" w={180} />
                </Group>
            </Paper>

            {/* Grid */}
            {loading ? (
                <Center h={400}><Stack align="center"><Loader size="xl" type="dots" /><Text size="sm" c="dimmed">Loading rooms...</Text></Stack></Center>
            ) : filteredRooms.length === 0 ? (
                <Paper p={60} withBorder radius="xl" style={{ borderStyle: 'dashed', borderWidth: 2 }}>
                    <Center>
                        <Stack align="center" gap="md">
                            <Box style={{ padding: 16, background: '#eff6ff', borderRadius: '50%' }}><IconBed size={48} color="#93c5fd" /></Box>
                            <Text fw={800} size="lg">{search ? 'No matching rooms' : 'No rooms yet'}</Text>
                            {!search && <Button radius="md" color="blue" leftSection={<IconPlus size={16} />} onClick={openAdd}>Add New Room</Button>}
                        </Stack>
                    </Center>
                </Paper>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                    {filteredRooms.map((room) => (
                        <Card key={room.id} shadow="md" padding="lg" radius="lg" withBorder>
                            <Card.Section style={{ position: 'relative', overflow: 'hidden' }}>
                                <img
                                    src={resolveImageUrl(room.imageUrl)}
                                    alt={room.name}
                                    style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                                    onError={(e) => { e.target.src = FALLBACK; }}
                                />
                                <Box style={{ position: 'absolute', top: 10, right: 10 }}>
                                    <Badge size="lg" variant="filled" color="dark">KES {Number(room.price).toLocaleString('en-KE')}</Badge>
                                </Box>
                                <Box style={{ position: 'absolute', top: 10, left: 10 }}>
                                    <Badge size="sm" variant="filled" color={STATUS_COLORS[room.status] || 'gray'}>
                                        {(room.status || 'unknown').toUpperCase()}
                                    </Badge>
                                </Box>
                            </Card.Section>
                            <Stack gap="xs" mt="md">
                                <Group justify="space-between" wrap="nowrap">
                                    <Text fw={700} size="lg" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</Text>
                                    <Badge color="blue" variant="light" size="sm">{(room.type || 'suite').toUpperCase()}</Badge>
                                </Group>
                                <Text size="sm" c="dimmed" lineClamp={2}>{room.description || 'No description provided.'}</Text>
                                <Divider my="sm" variant="dashed" />
                                <Group gap="xs">
                                    <Button variant="light" color="blue" style={{ flex: 1 }} radius="md" size="sm" leftSection={<IconEdit size={15} />} onClick={() => openEdit(room)}>Edit</Button>
                                    <ActionIcon variant="subtle" color="red" size="lg" radius="md" onClick={() => handleDelete(room.id, room.name)}><IconTrash size={17} /></ActionIcon>
                                </Group>
                            </Stack>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {/* Add / Edit Modal */}
            <Modal
                opened={opened} onClose={close}
                title={<Text fw={700} size="lg">{isEdit ? 'Edit Room' : 'Add New Room'}</Text>}
                size="lg" radius="md" overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
            >
                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <TextInput label="Room Name" placeholder="e.g. Ocean View Suite 101" required
                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        <Group grow>
                            <Select label="Room Type" required data={ROOM_TYPES} value={formData.type}
                                onChange={(val) => setFormData({ ...formData, type: val })} />
                            <Select label="Status" data={STATUS_OPTIONS} value={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val })} />
                        </Group>
                        <NumberInput label="Price per Night (KES)" placeholder="e.g. 12000" required min={0}
                            prefix="KES " thousandSeparator="," value={formData.price}
                            onChange={(val) => setFormData({ ...formData, price: val })} />
                        <Textarea label="Description" placeholder="Describe the room..." minRows={3}
                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

                        {/* Image Upload — upload only, shows current image if set */}
                        <Stack gap="xs">
                            <Text size="sm" fw={500}>Room Image</Text>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />

                            {/* Current image preview — always shown when imageUrl exists */}
                            {hasRealPreview && (
                                <Box style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                                    <img
                                        src={previewSrc}
                                        alt="Current room image"
                                        style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                                        onError={(e) => { e.target.src = FALLBACK; }}
                                    />
                                    <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                    >
                                        <Button size="xs" variant="white" leftSection={<IconUpload size={12} />} onClick={() => fileInputRef.current?.click()}>Replace</Button>
                                    </Box>
                                    <ActionIcon
                                        style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)' }}
                                        color="red" variant="subtle" size="sm" radius="xl"
                                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                    >
                                        <IconX size={14} />
                                    </ActionIcon>
                                </Box>
                            )}

                            {/* Upload button — shows when uploading or no image */}
                            {!hasRealPreview && (
                                <Button
                                    variant="light" color="blue"
                                    leftSection={uploadingImage ? <Loader size={14} /> : <IconUpload size={15} />}
                                    disabled={uploadingImage}
                                    onClick={() => fileInputRef.current?.click()}
                                    size="sm" radius="md" fullWidth
                                    style={{ height: 80, border: '2px dashed #93c5fd' }}
                                >
                                    {uploadingImage ? 'Uploading…' : 'Upload Image (JPG, PNG, WEBP)'}
                                </Button>
                            )}

                            {/* Show upload button below image when one already exists */}
                            {hasRealPreview && (
                                <Button
                                    variant="subtle" color="gray" size="xs"
                                    leftSection={uploadingImage ? <Loader size={12} /> : <IconUpload size={13} />}
                                    disabled={uploadingImage}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploadingImage ? 'Uploading…' : 'Replace Image'}
                                </Button>
                            )}
                        </Stack>

                        <Group justify="flex-end" mt="sm">
                            <Button variant="default" radius="md" onClick={close} disabled={saving}>Cancel</Button>
                            <Button type="submit" radius="md" color="blue" loading={saving}>{isEdit ? 'Save Changes' : 'Create Room'}</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Stack>
    );
};

export default Rooms;
