import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ children, className = '', id = '' }) => {
    return (
        <motion.section
            id={id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`py-20 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto ${className}`}
        >
            {children}
        </motion.section>
    );
};

export default Section;
