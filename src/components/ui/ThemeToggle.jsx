import React from 'react';
import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <ActionIcon
            onClick={toggleColorScheme}
            variant="transparent"
            size="lg"
            radius="xl"
            aria-label="Toggle color scheme"
            className="relative overflow-hidden group"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={colorScheme}
                    initial={{ y: 20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.3, ease: 'backOut' }}
                    className="flex items-center justify-center w-full h-full"
                >
                    {isDark ? (
                        <IconSun
                            size={20}
                            stroke={1.5}
                            className="text-norden-gold-500 hover:text-white transition-colors"
                        />
                    ) : (
                        <IconMoon
                            size={20}
                            stroke={1.5}
                            className="text-norden-dark-700 hover:text-norden-gold-600 transition-colors"
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Subtle glow effect */}
            <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity ${isDark ? 'bg-orange-400' : 'bg-blue-400'}`} />
        </ActionIcon>
    );
};

export default ThemeToggle;
