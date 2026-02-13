import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Grid, Box, Image, Text, Title, Badge, Group, Stack, Button,
    Card, Loader, Center, Divider, List, ThemeIcon, NumberInput
} from '@mantine/core';
import {
    IconStar, IconMapPin, IconCheck, IconWifi, IconCoffee,
    IconCalendar, IconUsers, IconHome
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import useBookingSystemStore from '../store/useBookingSystemStore';
import { DatePickerInput } from '@mantine/dates';
import BookingInquiryModal from '../components/booking/BookingInquiryModal';

const PropertyDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        selectedProperty,
        propertyRooms,
        isLoading,
        fetchPropertyDetails,
        fetchPropertyRooms,
        searchFilters,
        setSearchFilters
    } = useBookingSystemStore();

    const [inquiryOpened, setInquiryOpened] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [dateRange, setDateRange] = useState([
        searchFilters.check_in ? new Date(searchFilters.check_in) : null,
        searchFilters.check_out ? new Date(searchFilters.check_out) : null
    ]);

    useEffect(() => {
        if (id) {
            fetchPropertyDetails(id);
            fetchPropertyRooms(id, searchFilters.check_in, searchFilters.check_out);
        }
    }, [id]);

    const handleInquiry = (room = null) => {
        setSelectedRoom(room);
        setInquiryOpened(true);
    };

    if (isLoading || !selectedProperty) {
        return (
            <Center h="100vh">
                <Loader size="xl" color="gold" />
            </Center>
        );
    }

    const inquiryContext = selectedRoom
        ? `Inquiry for ${selectedRoom.name} at ${selectedProperty.name}`
        : `General inquiry for ${selectedProperty.name}`;

    return (
        <Box className="bg-theme-bg min-h-screen pt-24 pb-16">
            <Container size="xl">
                {/* Hero Section */}
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Stack gap={4}>
                                    <Title order={1} className="font-serif text-4xl text-theme-text">
                                        {selectedProperty.name}
                                    </Title>
                                    <Group gap="xs">
                                        <IconMapPin size={18} className="text-gray-500" />
                                        <Text c="dimmed">{selectedProperty.address}, {selectedProperty.city}</Text>
                                    </Group>
                                </Stack>
                                <Badge size="xl" color="yellow" variant="filled" leftSection={<IconStar size={18} />}>
                                    {selectedProperty.ratings?.overall || 'New'}
                                </Badge>
                            </Group>

                            {selectedProperty.photos?.length > 0 && (
                                <Image
                                    src={selectedProperty.photos[0].url}
                                    height={450}
                                    radius="md"
                                    alt={selectedProperty.name}
                                    className="shadow-xl"
                                />
                            )}
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card shadow="md" radius="md" p="xl" withBorder className="sticky top-24">
                            <Stack gap="lg">
                                <Title order={3} className="font-serif">Request a Reservation</Title>

                                <DatePickerInput
                                    type="range"
                                    label="Preferred Arrival & Departure"
                                    placeholder="Pick dates"
                                    value={dateRange}
                                    onChange={setDateRange}
                                    minDate={new Date()}
                                    leftSection={<IconCalendar size={18} />}
                                />

                                <NumberInput
                                    label="Number of Residents"
                                    value={searchFilters.guests}
                                    onChange={(val) => setSearchFilters({ guests: val })}
                                    min={1}
                                    max={10}
                                    leftSection={<IconUsers size={18} />}
                                />

                                <Divider />

                                <Button size="lg" className="bg-norden-gold-500 text-norden-dark-900" onClick={() => handleInquiry()}>
                                    Inquire for Stay
                                </Button>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Rooms Selection */}
                <Box mt={60}>
                    <Title order={2} className="font-serif mb-8" id="rooms">Available Settings</Title>
                    <Stack gap="xl">
                        {propertyRooms.map((room) => (
                            <Card key={room.id} shadow="sm" radius="md" p={0} withBorder>
                                <Grid gutter={0}>
                                    <Grid.Col span={{ base: 12, sm: 4 }}>
                                        <Image
                                            src={room.photos?.[0]?.url || 'https://via.placeholder.com/400x300'}
                                            h="100%"
                                            alt={room.name}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 8 }}>
                                        <Stack p="xl" justify="space-between" h="100%">
                                            <Box>
                                                <Group justify="space-between">
                                                    <Title order={3}>{room.name}</Title>
                                                    <Text fw={700} size="xl" className="text-norden-gold-500">
                                                        From ${room.base_price}<Text span size="sm" fw={400} c="dimmed">/night</Text>
                                                    </Text>
                                                </Group>
                                                <Text c="dimmed" size="sm" mt="xs" lineClamp={2}>
                                                    {room.description}
                                                </Text>

                                                <Group gap="xl" mt="xl">
                                                    <Group gap="xs">
                                                        <IconUsers size={18} className="text-gray-500" />
                                                        <Text size="sm">Up to {room.max_occupancy} Residents</Text>
                                                    </Group>
                                                    <Group gap="xs">
                                                        <IconHome size={18} className="text-gray-500" />
                                                        <Text size="sm">{room.room_type}</Text>
                                                    </Group>
                                                </Group>
                                            </Box>

                                            <Group justify="flex-end" mt="xl">
                                                <Button
                                                    size="lg"
                                                    color="gold"
                                                    className="bg-norden-gold-500 hover:bg-norden-gold-400"
                                                    onClick={() => handleInquiry(room)}
                                                >
                                                    Inquire for Room
                                                </Button>
                                            </Group>
                                        </Stack>
                                    </Grid.Col>
                                </Grid>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            </Container>

            <BookingInquiryModal
                opened={inquiryOpened}
                onClose={() => setInquiryOpened(false)}
                context={inquiryContext}
            />
        </Box>
    );
};

export default PropertyDetailsPage;
