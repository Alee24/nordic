import React, { useState } from 'react';
import {
    Modal, TextInput, Textarea, Button, Stack,
    Text, Group, ThemeIcon, Box, SimpleGrid
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconMail, IconPhone, IconUser, IconCalendar, IconMessage2, IconSend } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const BookingInquiryModal = ({ opened, onClose, context = "" }) => {
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState([null, null]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        notifications.show({
            title: 'Inquiry Received',
            message: 'Our concierge will contact you shortly to finalize your reservation.',
            color: 'gold',
            icon: <IconSend size={18} />,
        });

        setLoading(false);
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Box py="sm">
                    <Text fw={900} size="2xl" className="font-serif tracking-tight text-norden-dark-900 dark:text-white">Reservation Enquiry</Text>
                    <Group gap={6} mt={2}>
                        <Box w={20} h={1} bg="norden-gold.5" />
                        <Text size="xs" c="norden-gold.6" fw={800} tt="uppercase" tracking={2}>Bespoke Coastal Living</Text>
                    </Group>
                </Box>
            }
            size="lg"
            radius="xl"
            padding="xl"
            overlayProps={{
                backgroundOpacity: 0.7,
                blur: 8,
            }}
            styles={{
                header: { background: 'transparent' },
                content: { overflow: 'hidden' }
            }}
        >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <IconSend size={120} />
            </div>

            <form onSubmit={handleSubmit}>
                <Stack gap="xl">
                    <Box>
                        <Text size="sm" c="dimmed" lh={1.6} fw={500}>
                            Experience the freedom of a private high-end apartment with the security and convenience
                            of a professional concierge. Please share your preferences below.
                        </Text>
                    </Box>

                    {context && (
                        <Box
                            p="md"
                            className="bg-norden-gold-500/5 border border-norden-gold-500/20 rounded-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-norden-gold-500" />
                            <Text size="xs" fw={900} tt="uppercase" c="norden-gold.7" tracking={1.5} mb={4}>Selected Suite</Text>
                            <Text size="md" fw={700} className="font-serif">{context}</Text>
                        </Box>
                    )}

                    <div className="space-y-6">
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                            <TextInput
                                label="Guest Name"
                                placeholder="Your full name"
                                required
                                size="md"
                                radius="md"
                                leftSection={<IconUser size={18} className="text-norden-gold-500" />}
                                styles={{ input: { backgroundColor: 'transparent' } }}
                            />
                            <TextInput
                                label="Email Address"
                                placeholder="your@email.com"
                                required
                                size="md"
                                radius="md"
                                leftSection={<IconMail size={18} className="text-norden-gold-500" />}
                                styles={{ input: { backgroundColor: 'transparent' } }}
                            />
                        </SimpleGrid>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                            <TextInput
                                label="Phone Number"
                                placeholder="+254 ..."
                                size="md"
                                radius="md"
                                leftSection={<IconPhone size={18} className="text-norden-gold-500" />}
                                styles={{ input: { backgroundColor: 'transparent' } }}
                            />
                            <DatePickerInput
                                type="range"
                                label="Event Dates"
                                placeholder="Pick stay dates"
                                value={dates}
                                onChange={setDates}
                                size="md"
                                radius="md"
                                leftSection={<IconCalendar size={18} className="text-norden-gold-500" />}
                                styles={{ input: { backgroundColor: 'transparent' } }}
                            />
                        </SimpleGrid>

                        <Textarea
                            label="Special Requests"
                            placeholder="Airport transfers, private chef, room preferences..."
                            minRows={3}
                            size="md"
                            radius="md"
                            leftSection={<IconMessage2 size={18} className="text-norden-gold-500" style={{ marginTop: '12px' }} />}
                            styles={{ input: { backgroundColor: 'transparent' } }}
                        />
                    </div>

                    <Box pt="md">
                        <Button
                            type="submit"
                            fullWidth
                            size="xl"
                            radius="xl"
                            loading={loading}
                            className="bg-norden-gold-500 hover:bg-norden-gold-600 text-norden-dark-900 font-bold uppercase tracking-widest shadow-xl shadow-norden-gold-500/20"
                            leftSection={<IconSend size={20} />}
                        >
                            Send Enquiry
                        </Button>
                        <Text size="xs" c="dimmed" ta="center" mt="md" fw={600} tracking={0.5}>
                            Our reservations team will respond within 2 hours.
                        </Text>
                    </Box>
                </Stack>
            </form>
        </Modal>
    );
};

export default BookingInquiryModal;
