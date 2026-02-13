import React, { useState, useEffect } from 'react';
import {
    Stack,
    Text,
    Group,
    Paper,
    TextInput,
    Button,
    Title,
    SimpleGrid,
    Badge,
    Loader,
    Center,
    Card,
    Divider,
    ActionIcon,
    Tooltip,
    Alert
} from '@mantine/core';
import {
    IconPlaneArrival,
    IconPlaneDeparture,
    IconSearch,
    IconRefresh,
    IconInfoCircle,
    IconAlertCircle
} from '@tabler/icons-react';
import { dashboardService } from '../../services/dashboardService';

const FlightTracker = () => {
    const [loading, setLoading] = useState(false);
    const [flights, setFlights] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);

    const fetchFlights = async (query = '') => {
        setLoading(true);
        setError(null);
        try {
            const params = query ? { flight_iata: query } : { limit: 12 };
            // Default to arrivals at MBA (Mombasa) if no query, as example for the hotel
            if (!query) {
                params.arr_iata = 'MBA';
            }

            const result = await dashboardService.getFlights(params);
            if (result.success) {
                setFlights(result.data.data || []);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred while fetching flight data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFlights(search);
    };

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <div>
                    <Title order={2} fw={800}>Flight Tracker</Title>
                    <Text size="sm" c="dimmed">Monitor guest arrivals and departures in real-time.</Text>
                </div>
                <ActionIcon variant="light" size="lg" onClick={() => fetchFlights(search)} loading={loading}>
                    <IconRefresh size={18} />
                </ActionIcon>
            </Group>

            <Paper p="md" radius="md" withBorder>
                <form onSubmit={handleSearch}>
                    <Group align="flex-end">
                        <TextInput
                            label="Flight Number"
                            placeholder="e.g. KQ604"
                            className="flex-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftSection={<IconPlaneDeparture size={16} />}
                        />
                        <Button leftSection={<IconSearch size={16} />} type="submit" loading={loading}>
                            Search
                        </Button>
                    </Group>
                </form>
            </Paper>

            {error && (
                <Alert icon={<IconAlertCircle size={16} />} title="API Error" color="red" variant="light">
                    {error}
                </Alert>
            )}

            {loading && flights.length === 0 ? (
                <Center h={300}>
                    <Stack align="center">
                        <Loader size="xl" />
                        <Text c="dimmed">Fetching real-time flight data...</Text>
                    </Stack>
                </Center>
            ) : flights.length === 0 ? (
                <Center h={300}>
                    <Paper shadow="xs" p="xl" withBorder style={{ textAlign: 'center' }}>
                        <IconInfoCircle size={40} color="gray" />
                        <Text mt="md" fw={500}>No flights found</Text>
                        <Text size="sm" c="dimmed">Try searching for a different flight number or airport code.</Text>
                    </Paper>
                </Center>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {flights.map((flight, idx) => (
                        <Card key={idx} padding="lg" radius="md" withBorder>
                            <Group justify="space-between" mb="xs">
                                <Badge size="lg" variant="filled" color="blue">
                                    {flight.flight.iata || flight.flight.number}
                                </Badge>
                                <Badge color={flight.flight_status === 'active' ? 'green' : 'gray'}>
                                    {flight.flight_status.toUpperCase()}
                                </Badge>
                            </Group>

                            <Group gap="xs" mb="md">
                                <Text fw={700} size="sm">{flight.airline.name}</Text>
                            </Group>

                            <Divider mb="md" />

                            <Group justify="space-between" align="flex-start" mb="md">
                                <Stack gap={0}>
                                    <Text size="xs" c="dimmed" tt="uppercase">Departure</Text>
                                    <Text fw={600}>{flight.departure.iata}</Text>
                                    <Text size="xs">{flight.departure.airport}</Text>
                                </Stack>
                                <IconPlaneDeparture size={16} className="text-gray-400 mt-4" />
                                <Stack gap={0} style={{ textAlign: 'right' }}>
                                    <Text size="xs" c="dimmed" tt="uppercase">Arrival</Text>
                                    <Text fw={600}>{flight.arrival.iata}</Text>
                                    <Text size="xs">{flight.arrival.airport}</Text>
                                </Stack>
                            </Group>

                            <Group justify="space-between" className="bg-gray-50 p-2 rounded">
                                <Stack gap={0}>
                                    <Text size="xs" c="dimmed">Scheduled Arr</Text>
                                    <Text size="sm" fw={600}>
                                        {new Date(flight.arrival.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </Stack>
                                <Stack gap={0} style={{ textAlign: 'right' }}>
                                    <Text size="xs" c="dimmed">Gate</Text>
                                    <Text size="sm" fw={600}>{flight.arrival.gate || 'N/A'}</Text>
                                </Stack>
                            </Group>
                        </Card>
                    ))}
                </SimpleGrid>
            )}
        </Stack>
    );
};

export default FlightTracker;
