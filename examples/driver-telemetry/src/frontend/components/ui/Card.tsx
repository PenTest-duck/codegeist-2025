/**
 * Card Component
 * F1-themed card with dark styling and hover effects
 */

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', animate = true }) => {
  const Component = animate ? motion.div : 'div';

  return (
    <Component
      className={`f1-card ${className}`}
      {...(animate && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      })}
    >
      {children}
    </Component>
  );
};
