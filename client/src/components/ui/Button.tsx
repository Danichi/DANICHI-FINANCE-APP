import React from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: [
    'bg-[var(--accent-orange)] text-white font-bold',
    'border-[2px] border-[#18130e] shadow-btn',
    'hover:-translate-x-px hover:-translate-y-px hover:shadow-btn-hover',
  ].join(' '),
  secondary: [
    'bg-white text-[#18130e] font-semibold',
    'border-[2px] border-[#18130e] shadow-btn',
    'hover:-translate-x-px hover:-translate-y-px hover:shadow-btn-hover',
  ].join(' '),
  destructive: [
    'bg-[var(--red-dim)] text-[var(--red)] font-semibold',
    'border-[2px] border-[var(--red)] shadow-[3px_3px_0_var(--red)]',
    'hover:bg-[var(--red)] hover:text-white',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--text-secondary)] font-medium',
    'border-[2px] border-[var(--border-default)]',
    'hover:text-[var(--text-primary)] hover:border-[#18130e]',
  ].join(' '),
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs rounded-pill',
  md: 'px-5 py-2.5 text-sm rounded-pill',
  lg: 'px-7 py-3 text-sm rounded-pill',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
