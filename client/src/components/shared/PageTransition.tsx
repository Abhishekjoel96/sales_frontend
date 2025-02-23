// src/components/shared/PageTransition.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    key: string | number; // Add key prop
}

// Use a wrapper component
export function PageTransition({ children, key }: PageTransitionProps) {
    return (
        <motion.div
            key={key} // Use key prop here
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
}
