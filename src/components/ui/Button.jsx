import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: 'bg-nordic-gold-500 text-nordic-dark-900 hover:bg-nordic-gold-400',
    outline: 'border border-nordic-gold-500 text-nordic-gold-500 hover:bg-nordic-gold-500/10',
    ghost: 'text-nordic-frost hover:text-nordic-gold-500',
};

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-3 rounded-none font-serif tracking-in-expand-fwd transition-all duration-300 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
