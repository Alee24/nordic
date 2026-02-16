import React from 'react';
import { Paper, Text, Group } from '@mantine/core';
import { AreaChart } from '@mantine/charts';

export function RevenueChart({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <Paper withBorder p="md" radius="md" className="h-full">
            <Group justify="space-between" mb="md">
                <div>
                    <Text size="lg" fw={700} className="text-gray-800 dark:text-gray-100">Revenue Trends</Text>
                    <Text size="xs" c="dimmed" className="uppercase tracking-wider">Last 12 Months</Text>
                </div>
            </Group>

            <AreaChart
                h={300}
                data={data}
                dataKey="month"
                series={[
                    { name: 'revenue', color: 'indigo.6', label: 'Revenue ($)' },
                ]}
                curveType="natural"
                tickLine="y"
                gridAxis="xy"
                withGradient
                tooltipAnimationDuration={200}
                valueFormatter={(value) => `KES ${new Intl.NumberFormat('en-US').format(value)}`}
            />
        </Paper>
    );
}
