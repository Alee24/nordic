import React, { useState, useEffect } from 'react';
import {
    Modal,
    Stack,
    TextInput,
    Group,
    NumberInput,
    Textarea,
    MultiSelect,
    Button,
    Text,
    Divider,
    Paper,
    SimpleGrid,
    rem,
    useMantineTheme,
    NavLink,
    LoadingOverlay,
    ScrollArea,
    FileButton
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { dashboardService } from '../../../services/dashboardService';

const RoomFormModal = ({ opened, onClose, room, isEdit, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        price_per_night: 0,
        capacity: 2,
        description: '',
        features: [],
        images: []
    });

    useEffect(() => {
        if (isEdit && room) {
            setFormData({
                id: room.id,
                title: room.title,
                price_per_night: Number(room.price_per_night),
                capacity: room.capacity,
                description: room.description,
                features: room.features || [],
                images: room.images || []
            });
        } else {
            setFormData({
                id: '',
                title: '',
                price_per_night: 0,
                capacity: 2,
                description: '',
                features: [],
                images: []
            });
        }
    }, [isEdit, room, opened]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            let response;
            if (isEdit) {
                response = await dashboardService.updateRoom(room.id, formData);
            } else {
                response = await dashboardService.addRoom(formData);
            }

            if (response.success) {
                notifications.show({
                    title: 'Success',
                    message: `Room ${isEdit ? 'updated' : 'added'} successfully`,
                    color: 'green'
                });
                onSuccess();
                onClose();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Text fw={700} size="lg">
                    {isEdit ? 'Update Room Suite' : 'Add New Room Suite'}
                </Text>
            }
            size="lg"
            radius="md"
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Paper p="sm" bg="gray.0" radius="sm">
                        <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">Basic Information</Text>
                        <Stack gap="sm">
                            {!isEdit && (
                                <TextInput
                                    label="Room ID"
                                    placeholder="e.g. norden-sky"
                                    required
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                />
                            )}
                            <TextInput
                                label="Title"
                                placeholder="e.g. Norden Sky Penthouse"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </Stack>
                    </Paper>

                    <Paper p="sm" bg="gray.0" radius="sm">
                        <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">Pricing & Capacity</Text>
                        <SimpleGrid cols={2}>
                            <NumberInput
                                label="Price per Night"
                                prefix="$"
                                required
                                min={0}
                                value={formData.price_per_night}
                                onChange={(val) => setFormData({ ...formData, price_per_night: val })}
                            />
                            <NumberInput
                                label="Guest Capacity"
                                required
                                min={1}
                                value={formData.capacity}
                                onChange={(val) => setFormData({ ...formData, capacity: val })}
                            />
                        </SimpleGrid>
                    </Paper>

                    <Paper p="sm" bg="gray.0" radius="sm">
                        <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">Details & Features</Text>
                        <Stack gap="sm">
                            <Textarea
                                label="Description"
                                placeholder="Describe the room experience..."
                                minRows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <MultiSelect
                                label="Room Features"
                                placeholder="Select amenities"
                                data={[
                                    'High-speed Wifi', 'Nespresso Coffee', 'Ocean View', 'City View',
                                    'Private Balcony', 'Smart TV', 'Mini Bar', 'Sauna Access',
                                    'Room Service', 'King Size Bed'
                                ]}
                                searchable
                                value={formData.features}
                                onChange={(val) => setFormData({ ...formData, features: val })}
                            />
                        </Stack>
                    </Paper>

                    <Paper p="sm" bg="gray.0" radius="sm">
                        <Group justify="space-between" mb="xs">
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Room Gallery</Text>
                            <Button
                                variant="subtle"
                                size="xs"
                                onClick={() => document.getElementById('room-image-upload').click()}
                                disabled={loading}
                            >
                                Add Image
                            </Button>
                            <input
                                id="room-image-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        setLoading(true);
                                        const result = await dashboardService.uploadImage(e.target.files[0]);
                                        if (result.success) {
                                            setFormData(prev => ({
                                                ...prev,
                                                images: [...prev.images, result.data.url]
                                            }));
                                            notifications.show({
                                                title: 'Success',
                                                message: 'Image uploaded successfully',
                                                color: 'green'
                                            });
                                        } else {
                                            notifications.show({
                                                title: 'Upload Failed',
                                                message: result.error,
                                                color: 'red'
                                            });
                                        }
                                        setLoading(false);
                                    }
                                }}
                            />
                        </Group>

                        {formData.images.length > 0 ? (
                            <SimpleGrid cols={3} spacing="xs">
                                {formData.images.map((img, index) => (
                                    <Paper key={index} radius="sm" withBorder pos="relative" style={{ overflow: 'hidden', height: rem(100) }}>
                                        <img
                                            src={img}
                                            alt={`Room ${index}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <Button
                                            pos="absolute"
                                            top={4}
                                            right={4}
                                            variant="filled"
                                            color="red"
                                            size="compact-xs"
                                            p={0}
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    images: prev.images.filter((_, i) => i !== index)
                                                }));
                                            }}
                                        >
                                            ×
                                        </Button>
                                    </Paper>
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Text size="xs" c="dimmed" ta="center" py="md" style={{ border: '1px dashed #ced4da', borderRadius: '4px' }}>
                                No images uploaded yet
                            </Text>
                        )}
                    </Paper>

                    <Button type="submit" loading={loading} mt="md" fullWidth radius="md" size="md">
                        {isEdit ? 'Save Changes' : 'Create Room'}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};

export default RoomFormModal;
