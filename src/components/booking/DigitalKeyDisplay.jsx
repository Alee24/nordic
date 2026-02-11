import React from 'react';
import { Modal, Text, Center, Stack, Button, Loader, Alert } from '@mantine/core';
import { QRCodeSVG } from 'qrcode.react';
import { IconLockOpen, IconKey, IconCheck } from '@tabler/icons-react';

const DigitalKeyDisplay = ({ opened, onClose, booking, active = true }) => {
    // Mock token if not provided
    const token = booking?.access_token || `nordic_access_${Math.random().toString(36).substr(2, 9)}`;
    const expiry = booking?.check_out || new Date(Date.now() + 86400000).toISOString();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Text fw={700} tt="uppercase" c="dimmed" size="xs" tracking={2}>Digital Key Access</Text>}
            centered
            size="sm"
            radius="lg"
            overlayProps={{ blur: 10 }}
        >
            <Stack align="center" gap="lg" py="md">
                <div className="text-center space-y-1">
                    <Text fw={700} size="xl" className="font-serif">Unit {booking?.unit_id || '2101'}</Text>
                    <Text size="sm" c="dimmed">Penthouse Collection • Floor 9</Text>
                </div>

                <div className="relative group cursor-pointer">
                    <Center className={`p-6 rounded-2xl border-2 ${active ? 'border-green-500 bg-green-50' : 'border-gray-200'} transition-all`}>
                        <QRCodeSVG
                            value={JSON.stringify({ t: token, u: booking?.unit_id })}
                            size={200}
                            level="H"
                            includeMargin
                        />
                    </Center>

                    {/* Scan Animation Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/20 to-transparent h-1/4 w-full animate-[scan_2s_ease-in-out_infinite] pointer-events-none rounded-2xl" />
                </div>

                <div className="text-center w-full">
                    <Text size="xs" c="dimmed" mb={4}>ACCESS TOKEN</Text>
                    <code className="bg-gray-100 px-3 py-1 rounded text-xs font-mono block w-full truncate">{token}</code>
                    <Text size="xs" c="green" mt={2}>Active until {new Date(expiry).toLocaleDateString()}</Text>
                </div>

                <Button
                    fullWidth
                    size="lg"
                    color="green"
                    leftSection={<IconLockOpen size={20} />}
                    className="animate-pulse"
                >
                    Tap to Unlock Room
                </Button>

                <Alert icon={<IconCheck size={16} />} color="blue" variant="light" title="How to use">
                    Scan this QR code at your suite door or the main lobby reader to gain access.
                </Alert>
            </Stack>
        </Modal>
    );
};

export default DigitalKeyDisplay;
