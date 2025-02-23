// src/components/shared/AnimatedCard.tsx
import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      whileHover={{ scale: 1.01 }}
      className={`transform transition-all duration-150 ${className}`}
    >
      {children}
    </motion.div>
  );
}