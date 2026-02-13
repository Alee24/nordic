import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Card, Image, Text, Badge, Group, Button, Stack, Loader, Center, TextInput, Select, NumberInput, RangeSlider } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconMapPin, IconStar, IconUsers, IconFilter } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import useBookingSystemStore from '../store/useBookingSystemStore';

const BookingSearchPage = () => {
    const navigate = useNavigate();
    const {
        searchFilters,
        searchResults,
        isSearching,
        setSearchFilters,
        searchProperties,
    } = useBookingSystemStore();

    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState([null, null]);

    useEffect(() => {
        // Initial search
        searchProperties();
    }, []);

    const handleSearch = () => {
        const filters = {
            ...searchFilters,
            check_in: dateRange[0] ? dateRange[0].toISOString().split('T')[0] : null,
            check_out: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : null,
        };
        setSearchFilters(filters);
        searchProperties();
    };

    const PropertyCard = ({ property }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                shadow="md"
                padding="lg"
                radius="md"
                className="h-full cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => navigate(`/property/${property.id}`)}
            >
                <Card.Section>
                    <Image
                        src={property.primary_photo || 'https://via.placeholder.com/400x250'}
                        height={250}
                        alt={property.name}
                    />
                </Card.Section>

                <Stack gap="sm" mt="md">
                    <Group justify="space-between">
                        <Text fw={600} size="lg" className="text-theme-text">
                            {property.name}
                        </Text>
                        {property.avg_rating && (
                            <Badge
                                leftSection={<IconStar size={14} />}
                                color="yellow"
                                variant="filled"
                            >
                                {property.avg_rating}
                            </Badge>
                        )}
                    </Group>

                    <Group gap="xs">
                        <IconMapPin size={16} className="text-gray-500" />
                        <Text size="sm" c="dimmed">
                            {property.city}, {property.country}
                        </Text>
                    </Group>

                    <Text size="sm" c="dimmed" lineClamp={2}>
                        {property.description}
                    </Text>

                    <Group justify="space-between" mt="md">
                        <div>
                            <Text size="xs" c="dimmed">From</Text>
                            <Text size="xl" fw={700} className="text-norden-gold-500">
                                ${property.price_from}
                            </Text>
                            <Text size="xs" c="dimmed">per night</Text>
                        </div>
                        <Button
                            variant="filled"
                            color="gold"
                            className="bg-norden-gold-500 hover:bg-norden-gold-400"
                        >
                            View Details
                        </Button>
                    </Group>

                    {property.review_count > 0 && (
                        <Text size="xs" c="dimmed">
                            {property.review_count} reviews
                        </Text>
                    )}
                </Stack>
            </Card>
        </motion.div>
    );

    return (
        <div className="bg-theme-bg min-h-screen pt-20">
            {/* Search Bar */}
            <div className="bg-gradient-to-r from-norden-dark-800 to-norden-dark-900 py-12">
                <Container size="xl">
                    <Stack gap="lg">
                        <Text size="xl" fw={700} className="text-white text-center">
                            Find Your Perfect Stay
                        </Text>

                        <Card shadow="lg" padding="lg" radius="md">
                            <Grid gutter="md">
                                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                    <TextInput
                                        placeholder="Where are you going?"
                                        leftSection={<IconMapPin size={18} />}
                                        value={searchFilters.city}
                                        onChange={(e) => setSearchFilters({ city: e.target.value })}
                                    />
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                    <DatePickerInput
                                        type="range"
                                        placeholder="Check-in - Check-out"
                                        value={dateRange}
                                        onChange={setDateRange}
                                        minDate={new Date()}
                                    />
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                                    <NumberInput
                                        placeholder="Guests"
                                        leftSection={<IconUsers size={18} />}
                                        value={searchFilters.guests}
                                        onChange={(value) => setSearchFilters({ guests: value })}
                                        min={1}
                                        max={10}
                                    />
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                    <Button
                                        fullWidth
                                        leftSection={<IconSearch size={18} />}
                                        className="bg-norden-gold-500 hover:bg-norden-gold-400"
                                        onClick={handleSearch}
                                        loading={isSearching}
                                    >
                                        Search
                                    </Button>
                                </Grid.Col>
                            </Grid>

                            {/* Filters Toggle */}
                            <Button
                                variant="subtle"
                                leftSection={<IconFilter size={18} />}
                                onClick={() => setShowFilters(!showFilters)}
                                mt="md"
                            >
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <Grid gutter="md" mt="md">
                                        <Grid.Col span={{ base: 12, md: 4 }}>
                                            <Select
                                                label="Property Type"
                                                placeholder="All types"
                                                data={[
                                                    { value: '', label: 'All Types' },
                                                    { value: 'hotel', label: 'Hotel' },
                                                    { value: 'apartment', label: 'Apartment' },
                                                    { value: 'hostel', label: 'Hostel' },
                                                    { value: 'resort', label: 'Resort' },
                                                    { value: 'villa', label: 'Villa' },
                                                ]}
                                                value={searchFilters.property_type}
                                                onChange={(value) => setSearchFilters({ property_type: value })}
                                            />
                                        </Grid.Col>

                                        <Grid.Col span={{ base: 12, md: 4 }}>
                                            <Select
                                                label="Sort By"
                                                data={[
                                                    { value: 'rating', label: 'Highest Rated' },
                                                    { value: 'price_low', label: 'Price: Low to High' },
                                                    { value: 'price_high', label: 'Price: High to Low' },
                                                ]}
                                                value={searchFilters.sort_by}
                                                onChange={(value) => setSearchFilters({ sort_by: value })}
                                            />
                                        </Grid.Col>

                                        <Grid.Col span={{ base: 12, md: 4 }}>
                                            <Text size="sm" fw={500} mb="xs">Price Range</Text>
                                            <RangeSlider
                                                min={0}
                                                max={500}
                                                step={10}
                                                value={[searchFilters.min_price || 0, searchFilters.max_price || 500]}
                                                onChange={([min, max]) => setSearchFilters({ min_price: min, max_price: max })}
                                                marks={[
                                                    { value: 0, label: '$0' },
                                                    { value: 250, label: '$250' },
                                                    { value: 500, label: '$500+' },
                                                ]}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </motion.div>
                            )}
                        </Card>
                    </Stack>
                </Container>
            </div>

            {/* Results */}
            <Container size="xl" py="xl">
                {isSearching ? (
                    <Center h={400}>
                        <Loader size="xl" />
                    </Center>
                ) : searchResults.length === 0 ? (
                    <Center h={400}>
                        <Stack align="center">
                            <Text size="xl" c="dimmed">No properties found</Text>
                            <Text size="sm" c="dimmed">Try adjusting your search filters</Text>
                        </Stack>
                    </Center>
                ) : (
                    <>
                        <Text size="lg" fw={600} mb="xl" className="text-theme-text">
                            {searchResults.length} properties found
                        </Text>

                        <Grid gutter="lg">
                            {searchResults.map((property) => (
                                <Grid.Col key={property.id} span={{ base: 12, sm: 6, md: 4 }}>
                                    <PropertyCard property={property} />
                                </Grid.Col>
                            ))}
                        </Grid>
                    </>
                )}
            </Container>
        </div>
    );
};

export default BookingSearchPage;
