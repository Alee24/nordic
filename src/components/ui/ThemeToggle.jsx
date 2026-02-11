import React from 'react';
import { useMantineColorScheme, ActionIcon, useComputedColorScheme } from '@mantine/core';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

    const toggleTheme = () => {
        setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ActionIcon
            onClick={toggleTheme}
            variant="transparent"
            size="lg"
            className="text-nordic-gold-500 hover:text-nordic-gold-400 focus:outline-none flex items-center justify-center overflow-hidden"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={computedColorScheme}
                    initial={{ y: -20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex items-center justify-center"
                >
                    {computedColorScheme === 'dark' ? (
                        <Sun size={20} strokeWidth={1.5} />
                    ) : (
                        <Moon size={20} strokeWidth={1.5} />
                    )}
                </motion.div>
            </AnimatePresence>
        </ActionIcon>
    );
};

export default ThemeToggle;
