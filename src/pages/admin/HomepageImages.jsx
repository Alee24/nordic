import React, { useState, useEffect, useRef } from 'react';
import {
    Paper, Title, Text, Group, Stack, Button, Badge,
    SimpleGrid, Loader, Alert, Modal, Tabs, ScrollArea,
    ActionIcon, Tooltip, Divider, Image
} from '@mantine/core';
import {
    IconPhoto, IconUpload, IconCheck, IconAlertCircle,
    IconRefresh, IconEye, IconSwitch2, IconFolder,
    IconPhotoEdit
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SECTION_COLORS = {
    'Hero Section': 'blue',
    'About Section': 'teal',
};

const sectionColor = (section) => SECTION_COLORS[section] || 'gray';

// ─── Sub-component: ImageCard ─────────────────────────────────────────────────
const ImageCard = ({ slot, onUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const imageUrl = slot.image_path
        ? (slot.image_path.startsWith('http') ? slot.image_path : slot.image_path)
        : null;

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate on client too
        const MAX = 10 * 1024 * 1024;
        if (file.size > MAX) {
            notifications.show({ title: 'File Too Large', message: 'Maximum upload size is 10 MB.', color: 'red', icon: <IconAlertCircle size={16} /> });
            return;
        }
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            notifications.show({ title: 'Invalid Type', message: 'Please upload a JPG, PNG, WebP or GIF image.', color: 'red', icon: <IconAlertCircle size={16} /> });
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('slot_key', slot.slot_key);
            formData.append('image', file);

            const res = await api.post('/homepage-images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            notifications.show({
                title: 'Image Updated!',
                message: `"${slot.label}" has been updated successfully.`,
                color: 'green',
                icon: <IconCheck size={16} />
            });
            onUpdate(slot.slot_key, res.data?.data?.image_path || slot.image_path);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Upload failed';
            notifications.show({ title: 'Upload Failed', message: msg, color: 'red', icon: <IconAlertCircle size={16} /> });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <Paper
                shadow="sm"
                radius="md"
                withBorder
                style={{
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                    cursor: 'default',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.13)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
            >
                {/* Thumbnail */}
                <div style={{ position: 'relative', height: 220, background: '#f1f5f9', overflow: 'hidden' }}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={slot.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                            <IconPhoto size={48} stroke={1} />
                        </div>
                    )}

                    {/* Section badge overlay */}
                    <div style={{ position: 'absolute', top: 10, left: 10 }}>
                        <Badge color={sectionColor(slot.section)} variant="filled" radius="sm" size="sm">
                            {slot.section}
                        </Badge>
                    </div>

                    {/* Preview button overlay */}
                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                        <Tooltip label="Preview full image">
                            <ActionIcon
                                variant="filled"
                                color="dark"
                                radius="md"
                                onClick={() => setModalOpen(true)}
                                size="sm"
                            >
                                <IconEye size={14} />
                            </ActionIcon>
                        </Tooltip>
                    </div>
                </div>

                {/* Info */}
                <Stack p="md" gap="xs">
                    <div>
                        <Text fw={700} size="sm" style={{ color: '#1e293b' }}>{slot.label}</Text>
                        {slot.description && (
                            <Text size="xs" c="dimmed" mt={2} lineClamp={2}>{slot.description}</Text>
                        )}
                    </div>

                    <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: '#475569',
                        wordBreak: 'break-all',
                    }}>
                        {slot.image_path || '— not set —'}
                    </div>

                    <Divider />

                    {/* Actions */}
                    <Group gap="xs">
                        {/* Upload new image */}
                        <Button
                            size="xs"
                            leftSection={uploading ? <Loader size={12} color="white" /> : <IconUpload size={14} />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            variant="filled"
                            color="blue"
                            flex={1}
                        >
                            {uploading ? 'Uploading…' : 'Upload New'}
                        </Button>

                        {/* Choose from library */}
                        <Tooltip label="Pick from image library">
                            <Button
                                size="xs"
                                leftSection={<IconFolder size={14} />}
                                onClick={() => setModalOpen(true)}
                                variant="light"
                                color="gray"
                            >
                                Library
                            </Button>
                        </Tooltip>
                    </Group>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                </Stack>
            </Paper>

            {/* Preview / Library Modal */}
            <SlotModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                slot={slot}
                onSelect={(path) => {
                    onUpdate(slot.slot_key, path, true /* pick from library */);
                    setModalOpen(false);
                }}
            />
        </>
    );
};

// ─── Sub-component: SlotModal (preview + library picker) ─────────────────────
const SlotModal = ({ opened, onClose, slot, onSelect }) => {
    const [tab, setTab] = useState('preview');
    const [library, setLibrary] = useState([]);
    const [fetchingLib, setFetchingLib] = useState(false);
    const [picking, setPicking] = useState(null);

    useEffect(() => {
        if (opened && tab === 'library' && library.length === 0) loadLibrary();
    }, [opened, tab]);

    const loadLibrary = async () => {
        setFetchingLib(true);
        try {
            const res = await api.get('/homepage-images');
            setLibrary(res.data?.data?.available_images || []);
        } catch {
            setLibrary([]);
        } finally {
            setFetchingLib(false);
        }
    };

    const handlePick = async (path) => {
        setPicking(path);
        try {
            const formData = new FormData();
            formData.append('slot_key', slot.slot_key);
            formData.append('existing_path', path);

            await api.post('/homepage-images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            notifications.show({
                title: 'Image Updated',
                message: `"${slot.label}" is now using ${path.split('/').pop()}`,
                color: 'green',
                icon: <IconCheck size={16} />
            });
            onSelect(path);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update image';
            notifications.show({ title: 'Error', message: msg, color: 'red', icon: <IconAlertCircle size={16} /> });
        } finally {
            setPicking(null);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <IconPhotoEdit size={20} style={{ color: '#2563eb' }} />
                    <Text fw={700}>{slot.label}</Text>
                </Group>
            }
            size="xl"
            radius="md"
        >
            <Tabs value={tab} onChange={setTab}>
                <Tabs.List mb="md">
                    <Tabs.Tab value="preview" leftSection={<IconEye size={14} />}>Current Image</Tabs.Tab>
                    <Tabs.Tab value="library" leftSection={<IconFolder size={14} />} onClick={loadLibrary}>
                        Images Library
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="preview">
                    {slot.image_path ? (
                        <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0f172a' }}>
                            <img
                                src={slot.image_path}
                                alt={slot.label}
                                style={{ width: '100%', maxHeight: 480, objectFit: 'contain', display: 'block' }}
                            />
                        </div>
                    ) : (
                        <Alert color="gray" icon={<IconPhoto size={16} />}>No image set for this slot yet.</Alert>
                    )}
                    <Text size="xs" c="dimmed" mt="sm">
                        Path: <code>{slot.image_path || '—'}</code>
                    </Text>
                </Tabs.Panel>

                <Tabs.Panel value="library">
                    <Text size="sm" c="dimmed" mb="md">
                        Click any image below to assign it to <strong>{slot.label}</strong>.
                    </Text>
                    {fetchingLib ? (
                        <Group justify="center" py="xl"><Loader /></Group>
                    ) : library.length === 0 ? (
                        <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                            No images found in the library. Upload images to the /images/ folder on the server.
                        </Alert>
                    ) : (
                        <ScrollArea h={420}>
                            <SimpleGrid cols={3} spacing="sm">
                                {library.map((imgPath) => {
                                    const isActive = slot.image_path === imgPath;
                                    return (
                                        <div
                                            key={imgPath}
                                            onClick={() => !picking && handlePick(imgPath)}
                                            style={{
                                                position: 'relative',
                                                borderRadius: 8,
                                                overflow: 'hidden',
                                                border: isActive ? '3px solid #2563eb' : '2px solid #e2e8f0',
                                                cursor: picking ? 'wait' : 'pointer',
                                                transition: 'border-color 0.15s, transform 0.15s',
                                                background: '#f1f5f9',
                                            }}
                                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = ''; }}
                                        >
                                            <img
                                                src={imgPath}
                                                alt={imgPath.split('/').pop()}
                                                style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                                            />
                                            {isActive && (
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    background: 'rgba(37,99,235,0.18)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Badge color="blue" variant="filled"><IconCheck size={12} /> Current</Badge>
                                                </div>
                                            )}
                                            {picking === imgPath && (
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    background: 'rgba(255,255,255,0.7)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Loader size="sm" />
                                                </div>
                                            )}
                                            <Text
                                                size="xs"
                                                ta="center"
                                                p={4}
                                                style={{ background: '#fff', borderTop: '1px solid #e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                            >
                                                {imgPath.split('/').pop()}
                                            </Text>
                                        </div>
                                    );
                                })}
                            </SimpleGrid>
                        </ScrollArea>
                    )}
                </Tabs.Panel>
            </Tabs>
        </Modal>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const HomepageImages = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSlots = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/homepage-images');
            setSlots(res.data?.data?.slots || []);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to load homepage images';
            setError(msg);
            notifications.show({ title: 'Load Error', message: msg, color: 'red', icon: <IconAlertCircle size={16} /> });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSlots(); }, []);

    // Called by child cards when an image is updated
    const handleUpdate = async (slotKey, newPath, fromLibrary = false) => {
        // Optimistically update the local state
        setSlots(prev => prev.map(s => s.slot_key === slotKey ? { ...s, image_path: newPath } : s));
        // If update came via library selection (POST already done in modal), skip refetch
        if (!fromLibrary) await fetchSlots();
    };

    if (loading) {
        return (
            <Stack align="center" justify="center" py={80}>
                <Loader size="lg" />
                <Text c="dimmed">Loading homepage images…</Text>
            </Stack>
        );
    }

    return (
        <Stack gap="lg">
            {/* Header */}
            <Group justify="space-between" align="flex-start">
                <div>
                    <Group gap="xs" mb={4}>
                        <div style={{
                            width: 36, height: 36,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <IconPhotoEdit size={20} color="#fff" />
                        </div>
                        <Title order={2} style={{ color: '#1e293b', fontWeight: 800 }}>
                            Homepage Images
                        </Title>
                    </Group>
                    <Text c="dimmed" size="sm">
                        Manage and update the images displayed on the public-facing homepage.
                        Upload a new image or pick one from the image library.
                    </Text>
                </div>
                <Button
                    variant="light"
                    leftSection={<IconRefresh size={16} />}
                    onClick={fetchSlots}
                    size="sm"
                >
                    Refresh
                </Button>
            </Group>

            {/* Error Alert */}
            {error && (
                <Alert color="red" icon={<IconAlertCircle size={16} />} title="Error loading images" withCloseButton onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Legend */}
            <Paper withBorder radius="md" p="md" style={{ background: '#f8fafc' }}>
                <Group gap="md" wrap="wrap">
                    <Group gap={6}>
                        <IconPhoto size={16} style={{ color: '#64748b' }} />
                        <Text size="sm" c="dimmed">Click <strong>Upload New</strong> to replace an image with a file from your device</Text>
                    </Group>
                    <Group gap={6}>
                        <IconFolder size={16} style={{ color: '#64748b' }} />
                        <Text size="sm" c="dimmed">Click <strong>Library</strong> to choose from existing images already on the server</Text>
                    </Group>
                </Group>
            </Paper>

            {/* Cards Grid */}
            {slots.length === 0 ? (
                <Alert color="blue" icon={<IconPhoto size={16} />}>
                    No homepage image slots configured yet. The backend will create defaults automatically.
                </Alert>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                    {slots.map(slot => (
                        <ImageCard key={slot.slot_key} slot={slot} onUpdate={handleUpdate} />
                    ))}
                </SimpleGrid>
            )}

            {/* Footer info */}
            <Paper withBorder radius="md" p="md" style={{ background: '#fffbeb', borderColor: '#fcd34d' }}>
                <Group gap="xs" mb={4}>
                    <IconAlertCircle size={16} style={{ color: '#d97706' }} />
                    <Text size="sm" fw={600} style={{ color: '#92400e' }}>After updating images</Text>
                </Group>
                <Text size="xs" c="dimmed">
                    Changes are saved immediately to the database. Uploaded images are stored in{' '}
                    <code>/uploads/homepage/</code> on the server and served via the{' '}
                    <code>/uploads</code> Apache alias. If you picked a library image (from{' '}
                    <code>/images/</code>), it comes from the built frontend dist folder.
                </Text>
            </Paper>

            {/* Footer */}
            <Text size="xs" c="dimmed" ta="center" mt="sm">
                Developed by |{' '}
                <a href="https://kkdes.co.ke/" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
                    KKDES
                </a>
            </Text>
        </Stack>
    );
};

export default HomepageImages;
