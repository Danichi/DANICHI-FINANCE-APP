import React from 'react';
import { cn } from '../../lib/utils';

interface SliderProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: string;
  color?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label, value, min = 0, max = 100, step = 1, onChange, displayValue, color, className,
}) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {label && (
      <div className="flex items-center justify-between">
        <label className="label-caps">{label}</label>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {displayValue ?? `${value}%`}
        </span>
      </div>
    )}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className={cn(
        'w-full h-2 rounded-full appearance-none cursor-pointer',
        'bg-[var(--bg-elevated)]',
        '[&::-webkit-slider-thumb]:appearance-none',
        '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
        '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
        '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md',
      )}
      style={{
        background: `linear-gradient(to right, ${color || 'var(--accent-orange)'} ${value}%, var(--bg-elevated) ${value}%)`,
      }}
    />
  </div>
);
