import React, { useState } from 'react';
import {
    Container, Paper, Title, Text, TextInput,
    PasswordInput, Button, Stack, Center, Box,
    Image, Alert, ThemeIcon, Divider
} from '@mantine/core';
import { IconLock, IconAlertCircle, IconArrowRight } from '@tabler/icons-react';
import useManagementStore from '../../store/useManagementStore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const login = useManagementStore(state => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <Box
            className="min-h-screen bg-theme-bg flex items-center justify-center p-6"
            style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2070&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <Box className="absolute inset-0 bg-norden-dark-900/80 backdrop-blur-sm" />

            <Container size="xs" className="relative z-10 w-full">
                <Paper radius="md" p="xl" withBorder className="bg-theme-bg shadow-2xl border-norden-gold-500/20">
                    <Stack align="center" gap="md" mb="xl">
                        <Box className="w-16 h-16 bg-norden-gold-500 rounded-full flex items-center justify-center shadow-lg mb-2">
                            <IconLock size={32} className="text-norden-dark-900" />
                        </Box>
                        <Title order={2} className="font-serif text-theme-text text-center">
                            Norden Suits <br />
                            <Text component="span" size="sm" tt="uppercase" tracking="widest" fw={700} c="gold">Administration</Text>
                        </Title>
                    </Stack>

                    {error && (
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            title="Authentication Failed"
                            color="red"
                            variant="light"
                            mb="lg"
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack gap="md">
                            <TextInput
                                label="Administrator Email"
                                placeholder="admin@nordensuits.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size="md"
                                className="text-theme-text"
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="Your secure password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                size="md"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                mt="xl"
                                loading={loading}
                                className="bg-norden-gold-500 hover:bg-norden-gold-400 text-norden-dark-900"
                                rightSection={<IconArrowRight size={18} />}
                            >
                                Enter Dashboard
                            </Button>
                        </Stack>
                    </form>

                    <Divider my="xl" label="Authorized Access Only" labelPosition="center" />

                    <Text size="xs" c="dimmed" ta="center">
                        This system is for authorized personnel only.
                        All access attempts are logged and monitored.
                    </Text>
                </Paper>

                <Box mt="md" ta="center">
                    <Button variant="subtle" color="gray" size="xs" onClick={() => navigate('/')}>
                        Return to Public Site
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default LoginPage;
