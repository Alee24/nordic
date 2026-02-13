import React from 'react';
import { Box, Text, Group, ThemeIcon } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';

const CustomDateInput = ({
    label,
    value,
    onChange,
    minDate,
    error,
    required = false,
    placeholder = 'Select date'
}) => {
    // Convert Date object to YYYY-MM-DD string
    const formatDateForInput = (date) => {
        if (!date) return '';
        if (typeof date === 'string') return date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Convert YYYY-MM-DD string to Date object
    const handleChange = (e) => {
        const dateString = e.target.value;
        if (dateString) {
            const date = new Date(dateString + 'T00:00:00');
            onChange(date);
        } else {
            onChange(null);
        }
    };

    const minDateString = minDate ? formatDateForInput(minDate) : undefined;
    const valueString = formatDateForInput(value);

    return (
        <Box>
            <Text size="sm" fw={500} mb={5}>
                {label} {required && <Text component="span" c="red">*</Text>}
            </Text>
            <Box pos="relative">
                <input
                    type="date"
                    value={valueString}
                    onChange={handleChange}
                    min={minDateString}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingLeft: '45px',
                        fontSize: '16px',
                        border: error ? '2px solid var(--mantine-color-red-6)' : '1px solid var(--mantine-color-gray-4)',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        colorScheme: 'light'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--mantine-color-gold-6)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = error ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-gray-4)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
                <Box
                    pos="absolute"
                    left={12}
                    top="50%"
                    style={{
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'var(--mantine-color-gray-6)'
                    }}
                >
                    <IconCalendar size={18} />
                </Box>
            </Box>
            {error && (
                <Text size="xs" c="red" mt={5}>
                    {error}
                </Text>
            )}
        </Box>
    );
};

export default CustomDateInput;
