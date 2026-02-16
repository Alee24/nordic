import React, { useState, useEffect } from 'react';
import {
    Paper,
    Text,
    Group,
    Button,
    Stack,
    SimpleGrid,
    Card,
    Image,
    Badge,
    ActionIcon,
    Loader,
    Center,
    TextInput,
    Select,
    Box,
    Transition,
    Divider
} from '@mantine/core';
import {
    IconPlus,
    IconSearch,
    IconBed,
    IconUsers,
    IconTrash,
    IconEdit,
    IconAdjustmentsHorizontal,
    IconTrendingUp,
    IconPhoto
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { dashboardService } from '../../services/dashboardService';
import RoomFormModal from './components/RoomFormModal';

const MOCK_ROOMS = [
    {
        id: 'suite-101',
        title: 'Royal Ocean Suite',
        description: 'Exquisite penthouse with floor-to-ceiling windows overlooking the Indian Ocean. Features a private infinity pool and designer furniture.',
        price_per_night: 450.00,
        capacity: 2,
        status: 'available',
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000']
    },
    {
        id: 'suite-102',
        title: 'Executive City View',
        description: 'Sophisticated suite with urban panorama. Ideal for business travelers seeking comfort and style.',
        price_per_night: 220.00,
        capacity: 2,
        status: 'occupied',
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2000']
    },
    {
        id: 'suite-201',
        title: 'Family Garden Suite',
        description: 'Spacious two-bedroom suite with direct access to private tropical gardens. Perfect for families.',
        price_per_night: 320.00,
        capacity: 4,
        status: 'cleaning',
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000']
    },
    {
        id: 'suite-202',
        title: 'Luxury Studio',
        description: 'Modern minimalist studio with premium finishes and high-speed fiber internet.',
        price_per_night: 180.00,
        capacity: 1,
        status: 'maintenance',
        images: ['https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=2000']
    },
    {
        id: 'suite-301',
        title: 'Presidential Penthouse',
        description: 'The pinnacle of luxury. 300sqm of pure elegance with private butler service and helipad access.',
        price_per_night: 1200.00,
        capacity: 6,
        status: 'available',
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2000']
    }
];

const Rooms = () => {
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [demoMode, setDemoMode] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [isEdit, setIsEdit] = useState(false);

    // Search & Filter state
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('price-low');

    useEffect(() => {
        fetchRooms();
    }, [demoMode]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            if (demoMode) {
                setTimeout(() => {
                    setRooms(MOCK_ROOMS);
                    setLoading(false);
                }, 500);
                return;
            }

            const response = await dashboardService.getRoomStatus(demoMode);
            if (response.success) {
                setRooms(response.data);
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
            if (!demoMode) setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Confirm room deletion? All configuration will be lost.')) return;

        try {
            const response = await dashboardService.deleteRoom(id);
            if (response.success) {
                notifications.show({
                    title: 'Deleted',
                    message: 'Room suite removed successfully',
                    color: 'orange'
                });
                fetchRooms();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red'
            });
        }
    };

    const filteredRooms = rooms
        .filter(room =>
        (room.title?.toLowerCase().includes(search.toLowerCase()) ||
            room.id?.toLowerCase().includes(search.toLowerCase()) ||
            (room.description && room.description.toLowerCase().includes(search.toLowerCase())))
        )
        .sort((a, b) => {
            if (sortBy === 'price-low') return a.price_per_night - b.price_per_night;
            if (sortBy === 'price-high') return b.price_per_night - a.price_per_night;
            if (sortBy === 'capacity') return b.capacity - a.capacity;
            return 0;
        });

    const roomCards = filteredRooms.map((room) => (
        <Card
            key={room.id}
            shadow="md"
            padding="lg"
            radius="lg"
            withBorder
            className="group hover:shadow-xl transition-all duration-300 border-gray-100 hover:border-blue-200"
        >
            <Card.Section className="relative overflow-hidden">
                <Image
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=2000'}
                    height={200}
                    alt={room.title}
                    className="group-hover:scale-105 transition-transform duration-500"
                />
                <Box className="absolute top-3 right-3">
                    <Badge size="lg" variant="filled" color="dark.4" className="backdrop-blur-md bg-opacity-70">
                        KES {Number(room.price_per_night).toLocaleString()}
                    </Badge>
                </Box>
            </Card.Section>

            <Stack gap="xs" mt="md">
                <Group justify="space-between" wrap="nowrap">
                    <Text fw={700} size="lg" className="truncate">{room.title}</Text>
                    <Badge color="blue.1" c="blue.7" variant="light" size="sm">
                        PER NIGHT
                    </Badge>
                </Group>

                <Text size="sm" c="dimmed" lineClamp={2} h={40}>
                    {room.description || 'No description available for this luxury suite.'}
                </Text>

                <Group gap="sm" mt="md">
                    <Badge
                        variant="light"
                        color="gray"
                        leftSection={<IconUsers size={14} />}
                        className="bg-gray-50 border-gray-100"
                    >
                        {room.capacity} GUESTS
                    </Badge>
                    <Badge
                        variant="light"
                        color="gray"
                        leftSection={<IconBed size={14} />}
                        className="bg-gray-50 border-gray-100"
                    >
                        SUITE
                    </Badge>
                </Group>

                <Divider my="sm" variant="dashed" />

                <Group gap="xs" mt="xs">
                    <Button
                        variant="light"
                        color="blue"
                        className="flex-1"
                        radius="md"
                        leftSection={<IconEdit size={16} />}
                        onClick={() => {
                            setSelectedRoom(room);
                            setIsEdit(true);
                            open();
                        }}
                    >
                        Edit
                    </Button>
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        size="lg"
                        radius="md"
                        onClick={() => handleDelete(room.id)}
                        className="hover:bg-red-50"
                    >
                        <IconTrash size={18} />
                    </ActionIcon>
                </Group>
            </Stack>
        </Card>
    ));

    return (
        <Stack gap="xl">
            <Group justify="space-between" align="end">
                <Box>
                    <Group gap="xs" mb={4}>
                        <IconBed size={28} className="text-blue-600" />
                        <Text size="2xl" fw={900} className="tracking-tight">Room Inventory</Text>
                    </Group>
                    <Text size="sm" c="dimmed">Manage building suites, pricing, and amenities.</Text>
                </Box>
                <Group gap="sm">
                    <Paper shadow="xs" p={4} radius="xl" className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex">
                        <button
                            onClick={() => setDemoMode(false)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!demoMode ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            LIVE
                        </button>
                        <button
                            onClick={() => setDemoMode(true)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${demoMode ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            DEMO
                        </button>
                    </Paper>
                    <Button
                        size="md"
                        radius="md"
                        leftSection={<IconPlus size={18} />}
                        boxShadow="md"
                        className="bg-blue-600 hover:bg-blue-700 transition-colors"
                        onClick={() => {
                            setSelectedRoom(null);
                            setIsEdit(false);
                            open();
                        }}
                    >
                        Create New Suite
                    </Button>
                </Group>
            </Group>

            <Paper p="md" radius="lg" withBorder className="bg-gray-50/50">
                <Group justify="space-between">
                    <TextInput
                        placeholder="Search rooms by name or ID..."
                        leftSection={<IconSearch size={16} />}
                        className="w-full md:w-96"
                        radius="md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Group>
                        <Select
                            placeholder="Sort by"
                            leftSection={<IconAdjustmentsHorizontal size={16} />}
                            data={[
                                { value: 'price-low', label: 'Price: Lowest' },
                                { value: 'price-high', label: 'Price: Highest' },
                                { value: 'capacity', label: 'Capacity' }
                            ]}
                            value={sortBy}
                            onChange={setSortBy}
                            radius="md"
                            w={180}
                        />
                    </Group>
                </Group>
            </Paper>

            {loading ? (
                <Center h={400}>
                    <Stack align="center">
                        <Loader size="xl" type="dots" />
                        <Text size="sm" c="dimmed" fw={500}>Syncing Room Inventory...</Text>
                    </Stack>
                </Center>
            ) : filteredRooms.length === 0 ? (
                <Paper p={60} withBorder radius="2xl" shadow="sm" className="border-dashed border-2">
                    <Center>
                        <Stack align="center" gap="md">
                            <Box className="p-4 bg-blue-50 rounded-full">
                                <IconSearch size={48} className="text-blue-300" />
                            </Box>
                            <Box style={{ textAlign: 'center' }}>
                                <Text fw={800} size="xl">No matching rooms found</Text>
                                <Text size="sm" c="dimmed" mt={4}>Try adjusting your search or filters to find what you're looking for.</Text>
                            </Box>
                            <Button
                                variant="light"
                                color="blue"
                                radius="md"
                                mt="sm"
                                onClick={() => { setSearch(''); setSortBy('price-low'); }}
                            >
                                Clear all filters
                            </Button>
                        </Stack>
                    </Center>
                </Paper>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                    {roomCards}
                </SimpleGrid>
            )}

            <RoomFormModal
                opened={opened}
                onClose={close}
                room={selectedRoom}
                isEdit={isEdit}
                onSuccess={fetchRooms}
            />
        </Stack>
    );
};

export default Rooms;
