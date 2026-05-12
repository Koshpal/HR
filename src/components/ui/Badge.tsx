import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', children, ...props }) => {
  const variants = {
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success-darkest)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-darkest)]',
    error: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
    info: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
    neutral: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
