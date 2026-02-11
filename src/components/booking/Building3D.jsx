import React, { useState, useEffect } from 'react';
import { Box, Text, Group, Badge, Paper, Transition, Button, ScrollArea, useMantineColorScheme, Tooltip } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBuildingSkyscraper, IconEye, IconHome, IconArrowUp, IconInfoCircle, IconMouse } from '@tabler/icons-react';

const Building3D = ({ onSelectFloor, onSelectUnit }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const [buildingData, setBuildingData] = useState([]);
    const [hoveredFloor, setHoveredFloor] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [viewSide, setViewSide] = useState('ocean'); // 'ocean' or 'city'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMap = async () => {
            try {
                // Mock Data Generator
                const floors = [];
                for (let i = 10; i >= 1; i--) {
                    floors.push({
                        floor_number: i,
                        units: [
                            {
                                id: `${i}01`,
                                view_type: 'ocean',
                                unit_type: '1_bedroom',
                                base_price: i > 8 ? 400 : i > 5 ? 300 : 250,
                                status: Math.random() > 0.4 ? 'available' : 'booked'
                            },
                            {
                                id: `${i}02`,
                                view_type: 'ocean',
                                unit_type: '1_bedroom',
                                base_price: i > 8 ? 400 : i > 5 ? 300 : 250,
                                status: Math.random() > 0.3 ? 'available' : 'booked'
                            },
                            {
                                id: `${i}03`,
                                view_type: 'city',
                                unit_type: 'studio',
                                base_price: i > 8 ? 350 : i > 5 ? 250 : 200,
                                status: Math.random() > 0.5 ? 'available' : 'booked'
                            },
                            {
                                id: `${i}04`,
                                view_type: 'city',
                                unit_type: 'studio',
                                base_price: i > 8 ? 350 : i > 5 ? 250 : 200,
                                status: Math.random() > 0.2 ? 'available' : 'booked'
                            }
                        ]
                    });
                }
                setBuildingData(floors);
            } catch (error) {
                console.error("Failed to load building map", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMap();
    }, []);

    // Scroll to bottom (ground floor) on mount


    const getFloorColor = (floor) => {
        if (floor > 8) return isDark ? 'rgba(218, 165, 32, 0.4)' : 'rgba(218, 165, 32, 0.2)'; // Gold/Penthouse
        if (floor > 5) return isDark ? 'rgba(64, 192, 87, 0.3)' : 'rgba(64, 192, 87, 0.15)';  // Premium
        return isDark ? 'rgba(34, 139, 230, 0.2)' : 'rgba(34, 139, 230, 0.1)'; // Standard
    };

    const getWindowColor = (status) => {
        if (status === 'available') return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse';
        return 'bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)] opacity-60';
    };

    return (
        <div className={`flex flex-col md:flex-row h-screen overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* LEFT: The Tower Visual */}
            <div className={`w-full md:w-1/2 lg:w-1/3 h-full relative flex items-center justify-center p-8 pt-24 ${isDark ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-black' : 'bg-gradient-to-b from-blue-50 via-white to-gray-100'}`}>

                {/* Visual Context: Sky/Ground */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className={`h-1/2 bg-gradient-to-b ${isDark ? 'from-blue-900/10' : 'from-blue-200/20'} to-transparent`} />
                </div>

                {/* Building Stack */}
                <ScrollArea h="85vh" type="never" offsetScrollbars>
                    <div className="flex flex-col items-center py-20 space-y-1 relative perspective-1000">
                        {/* Roof */}
                        <div className={`w-48 h-12 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} clip-path-polygon(20%_0%,_80%_0%,_100%_100%,_0%_100%) mb-[-4px] z-10`} />

                        {buildingData.map((floor) => (
                            <motion.div
                                key={floor.floor_number}
                                className="relative group cursor-pointer"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (30 - floor.floor_number) * 0.05 }}
                                onMouseEnter={() => setHoveredFloor(floor)}
                                onClick={() => setSelectedFloor(floor)}
                            >
                                {/* Floting Floor Info (Hover) */}
                                <div className={`absolute -right-32 top-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none ${isDark ? 'text-gold' : 'text-blue-600'}`}>
                                    <Badge size="sm" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>Level {floor.floor_number}</Badge>
                                    <span className="text-xs ml-2 font-mono">
                                        {floor.units.filter(u => u.status === 'available').length} Available
                                    </span>
                                </div>

                                {/* Floor Block */}
                                <div
                                    className={`
                                        w-64 h-12 border-b 
                                        transition-all duration-300 relative
                                        flex items-center justify-center
                                        ${isDark ? 'border-white/10' : 'border-black/5'}
                                        ${selectedFloor?.floor_number === floor.floor_number
                                            ? 'scale-110 z-20 shadow-[0_0_30px_rgba(255,215,0,0.5)] border-gold'
                                            : 'hover:scale-105 hover:z-10'}
                                    `}
                                    style={{
                                        backgroundColor: getFloorColor(floor.floor_number),
                                        backdropFilter: 'blur(5px)',
                                        transform: 'rotateX(10deg)'
                                    }}
                                >
                                    {/* Windows / Lights Effect mapped to units */}
                                    <div className="flex gap-4">
                                        {floor.units.map((unit) => (
                                            <Tooltip key={unit.id} label={`Unit ${unit.id}: ${unit.status}`} withArrow>
                                                <div
                                                    className={`w-5 h-8 transition-colors duration-500 rounded-sm ${getWindowColor(unit.status)}`}
                                                />
                                            </Tooltip>
                                        ))}
                                    </div>

                                    {/* Floor Label */}
                                    <div className={`absolute -left-12 text-xs font-mono font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {floor.floor_number}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Base */}
                        <div className={`w-72 h-4 ${isDark ? 'bg-gray-600' : 'bg-gray-400'} rounded-full mt-4 blur-sm`} />
                    </div>
                </ScrollArea>

                {/* Legend & Instructions */}
                <div className={`absolute bottom-8 left-8 right-8 p-4 rounded-xl backdrop-blur-md border shadow-lg ${isDark ? 'bg-black/80 border-gray-700 text-white' : 'bg-white/90 border-gray-200 text-gray-800'}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <Text size="xs" fw={700} mb={4} tt="uppercase" c="dimmed">Building Guide</Text>
                            <Group gap="md">
                                <Group gap={4}>
                                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_5px_green] animate-pulse"></div>
                                    <Text size="sm">Available</Text>
                                </Group>
                                <Group gap={4}>
                                    <div className="w-3 h-3 bg-red-500 rounded-full opacity-60"></div>
                                    <Text size="sm">Booked</Text>
                                </Group>
                            </Group>
                        </div>
                        <div className="text-right">
                            <Group gap={4} className="opacity-70 animate-bounce">
                                <IconMouse size={16} />
                                <Text size="xs">Scroll & Click to View</Text>
                            </Group>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Interaction Panel */}
            <div className={`flex-1 h-full border-l p-8 pt-28 relative overflow-y-auto transition-colors duration-500 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>

                {/* Header */}
                <div className="mb-12 max-w-2xl">
                    <Group className="mb-4">
                        <Badge color="yellow" size="lg" variant="dot">LIVE AVAILABILITY</Badge>
                        <Text size="sm" c="dimmed">Updated 2 mins ago</Text>
                    </Group>

                    <h1 className={`text-5xl font-serif mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Find Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 italic">Perfect Residence</span>
                    </h1>
                    <p className={`text-lg leading-relaxed max-w-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Explore the tower, check real-time availability (green windows), and select a floor to view detailed floor plans.
                    </p>
                </div>

                {/* Dynamic Content based on Selection */}
                <AnimatePresence mode="wait">
                    {selectedFloor ? (
                        <motion.div
                            key="floor-detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`rounded-2xl p-8 border shadow-xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-gray-200/50'}`}
                        >
                            <div className="flex justify-between items-end mb-8 border-b pb-6 border-dashed border-gray-700/30">
                                <div>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} tracking={1}>Selected Level</Text>
                                    <Text size="4xl" fw={700} className={isDark ? 'text-white' : 'text-gray-900'}>Floor {selectedFloor.floor_number}</Text>
                                    <Text c="yellow" fw={500} size="lg">{selectedFloor.floor_number > 8 ? 'Penthouse Collection' : selectedFloor.floor_number > 5 ? 'Premium Suites' : 'Standard Residences'}</Text>
                                </div>

                                {/* View Toggle */}
                                <Group>
                                    <Button.Group>
                                        <Button
                                            variant={viewSide === 'ocean' ? 'filled' : 'default'}
                                            color={viewSide === 'ocean' ? 'blue' : 'gray'}
                                            onClick={() => setViewSide('ocean')}
                                            leftSection={<IconEye size={16} />}
                                        >
                                            Ocean View
                                        </Button>
                                        <Button
                                            variant={viewSide === 'city' ? 'filled' : 'default'}
                                            color={viewSide === 'city' ? 'gray' : 'gray'}
                                            onClick={() => setViewSide('city')}
                                            leftSection={<IconBuildingSkyscraper size={16} />}
                                        >
                                            City View
                                        </Button>
                                    </Button.Group>
                                </Group>
                            </div>

                            {/* Units Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedFloor.units
                                    .filter(u => u.view_type === viewSide)
                                    .map((unit) => (
                                        <div
                                            key={unit.id}
                                            onClick={() => unit.status === 'available' && onSelectUnit(unit)}
                                            className={`
                                                group p-6 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden
                                                ${unit.status === 'available'
                                                    ? (isDark ? 'border-gray-700 hover:border-yellow-400 hover:bg-gray-700' : 'border-gray-100 hover:border-blue-500 hover:bg-blue-50')
                                                    : (isDark ? 'border-gray-800 opacity-40 cursor-not-allowed bg-gray-900' : 'border-gray-100 opacity-40 cursor-not-allowed bg-gray-50')}
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <Badge size="lg" color={unit.status === 'available' ? 'green' : 'red'}>
                                                    {unit.status}
                                                </Badge>
                                                <Text size="2xl" fw={700} className={isDark ? 'text-white' : 'text-gray-900'}>Unit {unit.id}</Text>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <Group gap="xs">
                                                    <IconHome size={18} className="text-gray-400" />
                                                    <Text size="md" c="dimmed">1 Bedroom Suite</Text>
                                                </Group>
                                                <Group gap="xs">
                                                    <IconEye size={18} className="text-gray-400" />
                                                    <Text size="md" c="dimmed">{viewSide === 'ocean' ? 'Panoramic Ocean' : 'Skyline City'}</Text>
                                                </Group>
                                            </div>

                                            <div className={`mt-4 pt-4 border-t flex justify-between items-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <Text size="xl" fw={700} className={isDark ? 'text-yellow-400' : 'text-blue-600'}>${unit.base_price}<span className="text-sm text-gray-500 font-normal">/night</span></Text>
                                                {unit.status === 'available' && (
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="blue"
                                                        rightSection={<IconArrowUp size={16} className="rotate-90 group-hover:translate-x-1 transition-transform" />}
                                                    >
                                                        Select
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>

                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {/* How it works guidance */}
                            <div className={`p-8 rounded-2xl border-2 border-dashed ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
                                <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>How to Reserve</h3>
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                                        <div>
                                            <Text fw={700} className={isDark ? 'text-white' : 'text-gray-900'}>Explore the Tower</Text>
                                            <Text size="sm" c="dimmed">Scroll through the 3D tower on the left. Green windows indicate available units.</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                                        <div>
                                            <Text fw={700} className={isDark ? 'text-white' : 'text-gray-900'}>Select a Floor</Text>
                                            <Text size="sm" c="dimmed">Click on any floor level to view detailed unit layouts and pricing.</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                                        <div>
                                            <Text fw={700} className={isDark ? 'text-white' : 'text-gray-900'}>Book Your Suite</Text>
                                            <Text size="sm" c="dimmed">Choose your preferred view (Ocean/City) and confirm your reservation.</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`flex items-center justify-center p-12 text-center opacity-50`}>
                                <div>
                                    <IconArrowUp size={48} className="mx-auto mb-2 text-gray-400 rotate-[-90deg] md:rotate-0" />
                                    <Text>Select a floor to begin</Text>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Building3D;
