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
                <Box>
                    <Text fw={700} size="xl" className="font-serif">Reservation Inquiry</Text>
                    <Text size="xs" c="dimmed" tt="uppercase" tracking={1}>Bespoke Coastal Living</Text>
                </Box>
            }
            size="lg"
            radius="md"
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Text size="sm" c="dimmed" mb="sm">
                        Please provide your details below. Our dedicated concierge team will review your request
                        and contact you with availability and personalized rates.
                    </Text>

                    {context && (
                        <Box p="sm" className="bg-norden-gold-500/10 border-l-4 border-norden-gold-500 rounded-r-md">
                            <Text size="xs" fw={700} tt="uppercase" c="gold.8">Inquiry Context</Text>
                            <Text size="sm">{context}</Text>
                        </Box>
                    )}

                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput
                            label="Guest Name"
                            placeholder="John Doe"
                            required
                            leftSection={<IconUser size={16} />}
                        />
                        <TextInput
                            label="Email Address"
                            placeholder="john@example.com"
                            required
                            leftSection={<IconMail size={16} />}
                        />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput
                            label="Phone Number"
                            placeholder="+254 ..."
                            leftSection={<IconPhone size={16} />}
                        />
                        <DatePickerInput
                            type="range"
                            label="Preferred Dates"
                            placeholder="Pick arrival & departure"
                            value={dates}
                            onChange={setDates}
                            leftSection={<IconCalendar size={16} />}
                        />
                    </SimpleGrid>

                    <Textarea
                        label="Special Requirements"
                        placeholder="Tell us about your needs (e.g., number of residents, airport transfer, private chef)..."
                        minRows={4}
                        leftSection={<IconMessage2 size={16} />}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        mt="md"
                        loading={loading}
                        className="bg-norden-gold-500 hover:bg-norden-gold-400 text-norden-dark-900"
                    >
                        Send Inquiry to Concierge
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};

export default BookingInquiryModal;
