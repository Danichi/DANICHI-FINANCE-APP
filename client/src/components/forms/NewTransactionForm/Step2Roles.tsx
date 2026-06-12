import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';
import type { FormState } from './index';
import type { Assignment } from '../../../types';

interface Props {
  state: FormState;
  dispatch: React.Dispatch<any>;
  onBack: () => void;
  onNext: () => void;
}

interface AssignmentPickerProps {
  label: string;
  description: string;
  value: Assignment;
  onChange: (v: Assignment) => void;
}

const AssignmentPicker: React.FC<AssignmentPickerProps> = ({ label, description, value, onChange }) => {
  const options: { v: Assignment; label: string; color?: string }[] = [
    { v: 'malachi', label: 'Malachi', color: 'var(--malachi-color)' },
    { v: 'split', label: 'Split 50/50' },
    { v: 'daniel', label: 'Daniel', color: 'var(--daniel-color)' },
  ];

  return (
    <div>
      <p className="text-sm font-medium text-[var(--text-primary)] mb-0.5">{label}</p>
      <p className="text-xs text-[var(--text-secondary)] mb-3">{description}</p>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            className={cn(
              'flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all duration-150',
              value === opt.v
                ? 'border-[2px] border-[var(--accent-orange)] bg-[var(--accent-orange-dim)] font-bold'
                : 'border-[2px] border-[#18130e] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]',
            )}
            style={value === opt.v && opt.color ? { color: opt.color, borderColor: opt.color, background: opt.color + '22' } : undefined}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Step2Roles: React.FC<Props> = ({ state, dispatch, onBack, onNext }) => (
  <Card>
    <h2 className="font-display text-xl mb-6">Who Did What</h2>
    <div className="flex flex-col gap-6">
      <AssignmentPicker
        label="Client Manager"
        description="Client Management = 10% of revenue"
        value={state.clientManagerAssignment}
        onChange={v => dispatch({ type: 'SET', field: 'clientManagerAssignment', value: v })}
      />
      <div className="border-t-[2px] border-[var(--border-default)]" />
      <AssignmentPicker
        label="Sales Commission"
        description="Sales Commission = 20% of revenue"
        value={state.salesCommissionAssignment}
        onChange={v => dispatch({ type: 'SET', field: 'salesCommissionAssignment', value: v })}
      />
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  </Card>
);
