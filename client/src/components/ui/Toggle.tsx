import { cn } from '../../lib/utils';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  color?: string;
}

interface ToggleProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Toggle<T extends string>({ options, value, onChange, className }: ToggleProps<T>) {
  return (
    <div className={cn('flex bg-[var(--bg-surface)] border-[2px] border-[#18130e] rounded-xl p-1 gap-1', className)}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150',
            value === opt.value
              ? 'bg-[var(--accent-orange)] text-white border-[2px] border-[#18130e] shadow-[2px_2px_0_#18130e]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white',
          )}
          style={value === opt.value && opt.color ? { backgroundColor: opt.color } : undefined}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
