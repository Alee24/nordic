import React from 'react';
import { SimpleGrid, Paper, Group, Text, ThemeIcon, RingProgress } from '@mantine/core';
import {
    IconBed, IconCalendarCheck, IconCurrencyDollar,
    IconUsers, IconCalendarX, IconHomeDollar,
} from '@tabler/icons-react';

export function StatsGrid({ data }) {
    if (!data) return null;

    const fmt = (n) => Number(n || 0).toLocaleString('en-KE');

    const cards = [
        {
            title: 'Total Revenue',
            value: `KES ${fmt(data.totalRevenue)}`,
            sub: `This month: KES ${fmt(data.monthlyRevenue)}`,
            icon: IconCurrencyDollar,
            color: 'green',
        },
        {
            title: 'Total Bookings',
            value: fmt(data.totalBookings),
            sub: `${fmt(data.confirmedBookings)} confirmed · ${fmt(data.pendingBookings)} pending`,
            icon: IconCalendarCheck,
            color: 'blue',
        },
        {
            title: 'Room Occupancy',
            value: `${data.occupancyRate ?? 0}%`,
            sub: `${fmt(data.availableRooms)} / ${fmt(data.totalRooms)} rooms available`,
            icon: IconBed,
            color: 'indigo',
            isRing: true,
            ringVal: data.occupancyRate || 0,
        },
        {
            title: 'Total Guests',
            value: fmt(data.totalGuests),
            sub: `${fmt(data.cancelledBookings)} cancelled bookings`,
            icon: IconUsers,
            color: 'orange',
        },
    ];

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {cards.map((card) => (
                <Paper
                    key={card.title}
                    withBorder
                    p="xl"
                    radius="lg"
                    style={{ transition: 'box-shadow 0.2s', cursor: 'default' }}
                    className="hover:shadow-xl"
                >
                    <Group justify="space-between" align="flex-start">
                        <div style={{ flex: 1 }}>
                            <Text fz="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: '0.08em' }}>
                                {card.title}
                            </Text>
                            <Text fw={800} fz="1.6rem" mt={4} style={{ lineHeight: 1.2 }}>
                                {card.isRing ? null : card.value}
                            </Text>
                        </div>
                        <ThemeIcon color={card.color} variant="light" size={48} radius="xl">
                            <card.icon size="1.6rem" stroke={1.5} />
                        </ThemeIcon>
                    </Group>

                    {card.isRing ? (
                        <Group gap="sm" mt="sm" align="center">
                            <RingProgress
                                size={72}
                                roundCaps
                                thickness={7}
                                sections={[{ value: Math.min(card.ringVal, 100), color: card.color }]}
                                label={
                                    <Text ta="center" fz="xs" fw={800}>{card.ringVal}%</Text>
                                }
                            />
                            <Text fz="sm" c="dimmed">{card.sub}</Text>
                        </Group>
                    ) : (
                        <Text fz="sm" c="dimmed" mt={6}>{card.sub}</Text>
                    )}
                </Paper>
            ))}
        </SimpleGrid>
    );
}
