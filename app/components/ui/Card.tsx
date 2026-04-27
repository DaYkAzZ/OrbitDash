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
        'rounded-2xl border border-zinc-700/50 bg-zinc-800/60 backdrop-blur-sm',
        hoverable ? 'cursor-pointer transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
