import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-zinc-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={[
          'h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground',
          'placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500',
          'disabled:opacity-50',
          error ? 'border-red-500' : '',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
