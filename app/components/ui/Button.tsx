import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400',
  secondary:
    'bg-surface-2 text-foreground hover:opacity-90 active:opacity-80 disabled:opacity-50',
  ghost:
    'bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs gap-1',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-colors duration-150 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-indigo-500',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
