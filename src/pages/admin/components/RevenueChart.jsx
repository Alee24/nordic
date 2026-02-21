import React from 'react';
import { Paper, Text, Group, Box } from '@mantine/core';
import { AreaChart } from '@mantine/charts';

export function RevenueChart({ data }) {
    const hasData = data && data.length > 0 && data.some(d => d.revenue > 0);

    if (!hasData) {
        return (
            <Paper withBorder p="xl" radius="lg" style={{ height: 380, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Text c="dimmed" fz="sm">No revenue data yet. Confirmed bookings will appear here.</Text>
            </Paper>
        );
    }

    return (
        <Paper withBorder p="xl" radius="lg" style={{ height: 380 }}>
            <Group justify="space-between" mb="xl">
                <Box>
                    <Text size="lg" fw={800}>Revenue Trend</Text>
                    <Text size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>Last 12 Months (KES)</Text>
                </Box>
            </Group>
            <AreaChart
                h={260}
                data={data}
                dataKey="month"
                series={[
                    { name: 'revenue', color: 'indigo.6', label: 'Revenue' },
                    { name: 'bookings', color: 'teal.5', label: 'Bookings' },
                ]}
                curveType="natural"
                tickLine="y"
                gridAxis="xy"
                withGradient
                withLegend
                tooltipAnimationDuration={200}
                valueFormatter={(value, series) =>
                    series === 'revenue'
                        ? `KES ${new Intl.NumberFormat('en-KE').format(value)}`
                        : `${value} bookings`
                }
            />
        </Paper>
    );
}
