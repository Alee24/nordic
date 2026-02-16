import React from 'react';
import { SimpleGrid, Paper, Group, Text, ThemeIcon, RingProgress } from '@mantine/core';
import {
    IconBed,
    IconCalendarStats,
    IconCash,
    IconUsers,
    IconTrendingUp
} from '@tabler/icons-react';

const statsConfig = [
    {
        title: 'Monthly Revenue',
        icon: IconCash,
        value: 'monthly_revenue',
        diff: 18,
        color: 'green',
        prefix: 'KES '
    },
    {
        title: 'Occupancy Rate',
        icon: IconBed,
        value: 'occupancy_rate',
        diff: -2,
        color: 'blue',
        isPercent: true
    },
    {
        title: 'RevPAR',
        icon: IconTrendingUp,
        value: 'revenue_per_room',
        diff: 8,
        color: 'indigo',
        prefix: 'KES '
    },
    {
        title: 'Total Guests',
        icon: IconUsers,
        value: 'total_guests',
        diff: 5,
        color: 'orange'
    },
];

export function StatsGrid({ data }) {
    if (!data) return null;

    const stats = statsConfig.map((stat) => {
        const rawValue = data[stat.value] || 0;
        const value = stat.prefix
            ? `${stat.prefix}${rawValue.toLocaleString()}`
            : stat.isPercent
                ? `${rawValue}%`
                : rawValue;

        return (
            <Paper withBorder p="md" radius="md" key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
                <Group justify="space-between">
                    <div>
                        <Text c="dimmed" tt="uppercase" fw={700} fz="xs" className="tracking-widest">
                            {stat.title}
                        </Text>
                        <Text fw={700} fz="xl" className="mt-2 text-gray-800 dark:text-gray-100">
                            {value}
                        </Text>
                    </div>
                    <ThemeIcon
                        color={stat.color}
                        variant="light"
                        size={48}
                        radius="md"
                    >
                        <stat.icon size="1.8rem" stroke={1.5} />
                    </ThemeIcon>
                </Group>

                {stat.isPercent ? (
                    <Group mt="xs">
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: rawValue, color: stat.color }]}
                            label={
                                <Text ta="center" fz="xs" fw={700}>
                                    {rawValue}%
                                </Text>
                            }
                        />
                        <div>
                            <Text c="dimmed" size="xs" mt="md">
                                Current Occupancy
                            </Text>
                        </div>
                    </Group>
                ) : (
                    <Text c="dimmed" fz="sm" mt="md">
                        <Text component="span" c={stat.diff > 0 ? 'teal' : 'red'} fw={700}>
                            {stat.diff}%
                        </Text>{' '}
                        {stat.diff > 0 ? 'increase' : 'decrease'} compared to last month
                    </Text>
                )}
            </Paper>
        );
    });

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {stats}
        </SimpleGrid>
    );
}
