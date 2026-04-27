import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-2xl border border-border bg-surface/80 backdrop-blur-sm',
        hoverable ? 'cursor-pointer transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
