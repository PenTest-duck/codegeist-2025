/**
 * Badge Component
 * Status badges with F1 racing colors
 */

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'yellow' | 'red' | 'primary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const variantClasses = {
    green: 'f1-badge-green',
    yellow: 'f1-badge-yellow',
    red: 'f1-badge-red',
    primary: 'bg-f1-ferrari/20 text-f1-ferrari border border-f1-ferrari/30',
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
