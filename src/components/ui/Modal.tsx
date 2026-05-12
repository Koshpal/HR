import React from 'react';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div 
        className={cn(
          'relative w-full max-w-lg bg-[var(--color-bg-card)] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200',
          className
        )}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]/30">
          {title && (
            <h2 className="text-xl font-bold font-heading text-[var(--color-text-primary)]">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
