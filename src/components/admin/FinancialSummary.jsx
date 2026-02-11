import React from 'react';
import { Title, Text, Group, Stack, SimpleGrid, RingProgress, Center, Box, Badge } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { IconArrowUpRight, IconTrendingUp } from '@tabler/icons-react';
import GlassCard from '../../components/common/GlassCard';

const data = [
    { date: 'Feb 1', revenue: 2400, occupancy: 65 },
    { date: 'Feb 2', revenue: 1900, occupancy: 60 },
    { date: 'Feb 3', revenue: 3200, occupancy: 85 },
    { date: 'Feb 4', revenue: 2800, occupancy: 78 },
    { date: 'Feb 5', revenue: 4500, occupancy: 92 },
    { date: 'Feb 6', revenue: 3900, occupancy: 88 },
    { date: 'Feb 7', revenue: 5100, occupancy: 95 },
];

const FinancialSummary = () => {
    return (
        <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, md: 3 }}>
                <GlassCard className="p-6">
                    <Text size="xs" tt="uppercase" lts={1} fw={700} opacity={0.6}>Daily Revenue</Text>
                    <Group justify="space-between" mt="xs">
                        <Title order={2}>$5,100</Title>
                        <Group gap={4} className="text-green-500">
                            <IconArrowUpRight size={16} />
                            <Text size="sm" fw={700}>12%</Text>
                        </Group>
                    </Group>
                </GlassCard>

                <GlassCard className="p-6">
                    <Text size="xs" tt="uppercase" lts={1} fw={700} opacity={0.6}>Occupancy</Text>
                    <Group justify="space-between" mt="xs">
                        <Title order={2}>95%</Title>
                        <Group gap={4} className="text-green-500">
                            <IconTrendingUp size={16} />
                            <Text size="sm" fw={700}>Luxury Peak</Text>
                        </Group>
                    </Group>
                </GlassCard>

                <GlassCard className="p-6 flex items-center justify-between">
                    <Box>
                        <Text size="xs" tt="uppercase" lts={1} fw={700} opacity={0.6}>M-Pesa Goal</Text>
                        <Title order={3} mt={4}>78% Complete</Title>
                    </Box>
                    <RingProgress
                        size={70}
                        thickness={6}
                        roundCaps
                        sections={[{ value: 78, color: 'gold' }]}
                        label={
                            <Center>
                                <IconTrendingUp size={16} className="text-nordic-gold" />
                            </Center>
                        }
                    />
                </GlassCard>
            </SimpleGrid>

            <GlassCard className="p-8">
                <Group justify="space-between" mb="xl">
                    <Box>
                        <Title order={4} className="font-serif italic text-xl">Financial Pulse</Title>
                        <Text size="xs" opacity={0.5}>Revenue vs Occupancy Trend (Last 7 Days)</Text>
                    </Box>
                    <Group>
                        <Badge variant="filled" color="gold">REVENUE</Badge>
                        <Badge variant="outline" color="white">OCCUPANCY</Badge>
                    </Group>
                </Group>

                <AreaChart
                    h={300}
                    data={data}
                    dataKey="date"
                    series={[
                        { name: 'revenue', color: 'gold.6' },
                        { name: 'occupancy', color: 'frost.6' },
                    ]}
                    curveType="monotone"
                    gridAxis="none"
                    withXAxis={false}
                    withYAxis={false}
                    withDots={false}
                    styles={{
                        root: { opacity: 0.9 }
                    }}
                />
            </GlassCard>
        </Stack>
    );
};

export default FinancialSummary;
