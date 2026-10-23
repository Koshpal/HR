import React from 'react';

interface FigmaIconProps {
  src: string;
  size: number;
  className?: string;
}

/** Renders an exported Figma SVG at its native square size. */
export const FigmaIcon: React.FC<FigmaIconProps> = ({ src, size, className = '' }) => (
  <img
    src={src}
    alt=""
    width={size}
    height={size}
    className={`block max-w-none shrink-0 ${className}`}
    draggable={false}
  />
);

export default FigmaIcon;
