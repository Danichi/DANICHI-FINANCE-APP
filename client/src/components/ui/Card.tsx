import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'orange' | 'surface';
}

const paddings = {
  none: '',
  sm: 'p-5',
  md: 'p-6',
  lg: 'p-8',
};

const variants = {
  default: 'bg-white border-[3px] border-[#18130e] shadow-card',
  orange: 'bg-[var(--accent-orange)] border-[3px] border-[#18130e] shadow-card text-white',
  surface: 'bg-[var(--bg-surface)] border-[3px] border-[#18130e] shadow-card',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hover, padding = 'md', variant = 'default', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-card transition-[transform,box-shadow] duration-150',
        variants[variant],
        hover && 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-card-hover',
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';
