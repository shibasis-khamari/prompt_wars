import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--surface-highlight)',
        animation: 'skeleton-pulse 1.4s ease-in-out infinite',
      }}
      className={`ui-skeleton ${className}`}
    />
  );
};
