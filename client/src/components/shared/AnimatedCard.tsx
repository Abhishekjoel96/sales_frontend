// src/components/shared/AnimatedCard.tsx
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number; // Optional delay in seconds
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start("visible");
          observer.unobserve(entry.target); // Stop observing once animated
        }
      },
      {
        root: null, // Use the viewport
        rootMargin: "0px",
        threshold: 0.1, // 10% of the card needs to be visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [controls]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: delay,
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};
