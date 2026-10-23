import React from 'react';

// Figma "Picture" no-photo variants: #d6e2f8 / dark text, and #ffa033 / #fff9ef text.
const PALETTES = [
  'bg-primary-100 text-neutral-800',
  'bg-warning-300 text-warning-50',
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

interface AvatarProps {
  name: string;
  photo?: string;
  className?: string;
}

/** 40px rounded-8 square avatar: photo when available, otherwise the initial on a Figma palette. */
export const Avatar: React.FC<AvatarProps> = ({ name, photo, className = '' }) => {
  const base = `relative size-10 shrink-0 overflow-hidden rounded-[8px] ${className}`;
  if (photo) {
    return (
      <div className={base}>
        <img src={photo} alt="" className="absolute inset-0 size-full rounded-[8px] object-cover" />
      </div>
    );
  }
  const initial = (name.trim().charAt(0) || '?').toUpperCase();
  return (
    <div
      className={`${base} flex items-center justify-center font-geist text-[14px] font-medium leading-[26px] ${PALETTES[hash(name) % PALETTES.length]}`}
    >
      {initial}
    </div>
  );
};

export default Avatar;
