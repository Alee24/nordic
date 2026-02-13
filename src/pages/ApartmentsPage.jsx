import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Text, Button, Badge, Group, Divider, ThemeIcon, Transition, useMantineColorScheme } from '@mantine/core';
import { IconCheck, IconInfoCircle, IconCurrencyDollar, IconBuildingSkyscraper } from '@tabler/icons-react';
import Building3D from '../components/booking/Building3D';
import ApartmentBookingModal from '../components/booking/ApartmentBookingModal';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

const ApartmentsPage = () => {
    const navigate = useNavigate();
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const handleSelectUnit = (unit) => {
        setSelectedUnit(unit);
        notifications.show({
            title: 'Unit Selected',
            message: `You selected Unit ${unit.id} on Floor ${Math.floor(unit.id / 100)}`,
            color: 'teal',
            icon: <IconBuildingSkyscraper size={18} />,
        });
    };

    const handleProceedToBooking = () => {
        if (!selectedUnit) return;
        setIsBookingModalOpen(true);
    };

    const handleBookingSuccess = () => {
        setSelectedUnit(null);
    };

    return (
        <div className={`min-h-screen relative transition-colors duration-500 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Background elements for depth */}
            <div className={`absolute inset-0 opacity-50 pointer-events-none ${isDark
                ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black'
                : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50 via-white to-gray-100'}`}
            />

            {/* Portal Header */}
            <div className="relative pt-32 pb-4 text-center z-10">
                <Text size="xs" fw={900} tt="uppercase" c="norden-gold-500" tracking={4} mb="xs">Guest Experience</Text>
                <h1 className="text-4xl md:text-6xl font-serif text-theme-text font-bold">Digital Arrival Portal</h1>
                <Text c="dimmed" mt="md" className="max-w-xl mx-auto">Select your reserved residence on the interactive model below to begin your self check-in process.</Text>
            </div>

            {/* Building3D component includes the padding and layout now */}
            <Building3D onSelectUnit={handleSelectUnit} />

            <ApartmentBookingModal
                opened={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                unit={selectedUnit}
                onSuccess={handleBookingSuccess}
            />

            {/* Floating Booking Summary (Visible when unit is selected) */}
            <Transition mounted={!!selectedUnit} transition="slide-up" duration={400} timingFunction="ease">
                {(styles) => (
                    <Paper
                        style={{ ...styles, position: 'fixed', bottom: 0, left: 0, right: 0 }}
                        className={`backdrop-blur-md border-t z-50 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'}`}
                    >
                        <Container size="xl">
                            <Grid align="center">
                                <Grid.Col span={{ base: 12, md: 8 }}>
                                    <Group>
                                        <ThemeIcon size="xl" radius="xl" color="yellow" variant="light" className="animate-pulse">
                                            <IconCheck />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="sm" c="dimmed">Your Selection</Text>
                                            <Group align="center" gap="xs">
                                                <Text size="xl" fw={700} className={isDark ? 'text-white' : 'text-gray-900'}>Unit {selectedUnit?.id}</Text>
                                                <Badge size="lg" color="yellow" variant="outline">Level {Math.floor(selectedUnit?.id / 100)}</Badge>
                                                <Badge size="lg" color={selectedUnit?.view_type === 'ocean' ? 'blue' : 'gray'}>
                                                    {selectedUnit?.view_type === 'ocean' ? 'Ocean View' : 'City View'}
                                                </Badge>
                                            </Group>
                                        </div>
                                    </Group>
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Group justify="flex-end">
                                        <div className="text-right mr-4">
                                            <Text size="xs" c="dimmed">Total / Night</Text>
                                            <Text size="xl" fw={700} className={isDark ? 'text-yellow-400' : 'text-blue-600'}>${selectedUnit?.base_price}</Text>
                                        </div>
                                        <Button
                                            size="xl"
                                            color="yellow"
                                            className={`${isDark ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'} font-bold shadow-lg transition-transform hover:-translate-y-1`}
                                            onClick={handleProceedToBooking}
                                            leftSection={<IconCurrencyDollar size={20} />}
                                        >
                                            Book Residence
                                        </Button>
                                    </Group>
                                </Grid.Col>
                            </Grid>
                        </Container>
                    </Paper>
                )}
            </Transition>
        </div>
    );
};

export default ApartmentsPage;
