import React from 'react';
import { Modal, Group, Text, Stack, SimpleGrid, Image, Divider, Badge, ScrollArea } from '@mantine/core';
import { Check, X, Users, Maximize, BedDouble, Wind, Tv, Wifi } from 'lucide-react';
import useComparisonStore from '../../store/useComparisonStore';

const ComparisonModal = () => {
    const { isModalOpen, closeModal, selectedRooms, removeRoom } = useComparisonStore();

    const renderFeature = (hasFeature) => (
        hasFeature ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-red-300" />
    );

    return (
        <Modal
            opened={isModalOpen}
            onClose={closeModal}
            size="90%"
            title={
                <Text size="xl" fw={900} className="uppercase tracking-widest text-theme-accent">
                    Room Types Comparison
                </Text>
            }
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
            styles={{
                header: { backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' },
                content: { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
                body: { padding: '2rem' }
            }}
        >
            <ScrollArea>
                <SimpleGrid cols={{ base: 1, sm: selectedRooms.length }} spacing="xl">
                    {selectedRooms.map((room) => (
                        <div key={room.id} className="relative bg-theme-bg rounded-2xl border border-theme-border p-4 transition-all hover:border-theme-accent/30">
                            <button
                                onClick={() => removeRoom(room.id)}
                                className="absolute top-2 right-2 z-10 bg-red-500/80 p-1.5 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X size={16} color="white" />
                            </button>

                            <Image
                                src={room.image}
                                height={200}
                                radius="lg"
                                fallbackSrc="/images/b11.jpg"
                                className="mb-4"
                            />

                            <Stack gap="xs" mb="lg">
                                <Text fw={800} size="lg" className="text-theme-accent uppercase tracking-wide">
                                    {room.name}
                                </Text>
                                <Group justify="space-between">
                                    <Text fw={900} size="xl">
                                        KES {room.price?.toLocaleString()}
                                        <Text span size="xs" fw={400} className="text-theme-muted ml-1 italic">/ night</Text>
                                    </Text>
                                    {room.badge && (
                                        <Badge variant="filled" color="yellow" size="sm" radius="xs">
                                            {room.badge}
                                        </Badge>
                                    )}
                                </Group>
                            </Stack>

                            <Divider mb="lg" color="dark.6" />

                            <Stack gap="md">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-theme-muted">
                                        <Users size={16} className="text-norden-gold-600" />
                                        <span>Max Capacity</span>
                                    </div>
                                    <Text fw={700}>{room.capacity || 2} Pax</Text>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-theme-muted">
                                        <Maximize size={16} className="text-norden-gold-600" />
                                        <span>Size</span>
                                    </div>
                                    <Text fw={700}>{room.size?.split('/')[0] || '60 sqm'}</Text>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-theme-muted">
                                        <BedDouble size={16} className="text-norden-gold-600" />
                                        <span>Bedrooms</span>
                                    </div>
                                    <Text fw={700}>{room.bedrooms || 1} Room</Text>
                                </div>

                                <Divider color="dark.8" label="Amenities" labelPosition="center" />

                                <SimpleGrid cols={2} spacing="xs">
                                    {[
                                        { label: 'High-speed WiFi', feature: 'wifi', icon: Wifi },
                                        { label: 'Fully Equipped Kitchen', feature: 'kitchen', icon: Wind },
                                        { label: 'QLED Smart TV', feature: 'tv', icon: Tv },
                                        { label: 'Private Parking', feature: 'parking', icon: Users }
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between p-2 rounded bg-norden-dark-900/50 border border-norden-gold-800/5">
                                            <div className="flex items-center gap-2">
                                                <item.icon size={14} className="text-norden-gold-700" />
                                                <Text size="xs" truncate>{item.label}</Text>
                                            </div>
                                            {renderFeature(room.features?.includes(item.feature))}
                                        </div>
                                    ))}
                                </SimpleGrid>

                                <Text size="xs" className="text-theme-muted italic line-clamp-3 mt-2">
                                    {room.description}
                                </Text>
                            </Stack>
                        </div>
                    ))}
                </SimpleGrid>
            </ScrollArea>
        </Modal>
    );
};

export default ComparisonModal;
