import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'flat';
}

export const Card: React.FC<CardProps> = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] shadow-sm',
    premium: 'bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1',
    flat: 'bg-[var(--color-bg-secondary)] border-none shadow-none',
  };

  return (
    <div
      className={cn(
        'rounded-3xl p-6',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
