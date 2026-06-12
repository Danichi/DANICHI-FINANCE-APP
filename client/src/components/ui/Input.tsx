import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="label-caps">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3.5 text-[var(--text-tertiary)] text-sm font-medium select-none">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-white border-[2px] border-[#18130e] rounded-xl',
              'text-[var(--text-primary)] text-sm font-medium placeholder:text-[var(--text-tertiary)] placeholder:font-normal',
              'transition-[border-color,box-shadow] duration-150',
              'focus:border-[var(--accent-orange)] focus:outline-none focus:ring-0',
              'focus:shadow-[0_0_0_3px_rgba(240,120,48,0.12)]',
              prefix ? 'pl-10' : 'pl-4',
              suffix ? 'pr-10' : 'pr-4',
              'py-3',
              error && 'border-[var(--red)] focus:border-[var(--red)]',
              className,
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-[var(--text-tertiary)] text-sm select-none">{suffix}</span>
          )}
        </div>
        {error && <span className="text-xs text-[var(--red)] font-medium">{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="label-caps">{label}</label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-white border-[2px] border-[#18130e] rounded-xl',
            'text-[var(--text-primary)] text-sm font-medium placeholder:text-[var(--text-tertiary)] placeholder:font-normal',
            'transition-[border-color,box-shadow] duration-150 resize-none',
            'focus:border-[var(--accent-orange)] focus:outline-none',
            'focus:shadow-[0_0_0_3px_rgba(240,120,48,0.12)]',
            'px-4 py-3',
            error && 'border-[var(--red)]',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-[var(--red)] font-medium">{error}</span>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
