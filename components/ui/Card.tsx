'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { hover = false, padding = 'md', className = '', children, ...props },
    ref
  ) => {
    const baseClasses = `
      bg-white dark:bg-slate-800
      rounded-2xl shadow-lg
      ${paddingClasses[padding]}
      ${hover ? 'transition-transform duration-200 hover:-translate-y-1' : ''}
      ${className}
    `;

    if (hover) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -3 }}
          className={baseClasses}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
