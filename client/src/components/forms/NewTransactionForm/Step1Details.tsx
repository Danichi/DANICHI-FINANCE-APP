import React from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import type { FormState } from './index';

interface Props {
  state: FormState;
  dispatch: React.Dispatch<any>;
  onNext: () => void;
}

export const Step1Details: React.FC<Props> = ({ state, dispatch, onNext }) => {
  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'SET', field, value: e.target.value });

  const canNext = state.clientName.trim() && state.grossAmount && parseFloat(state.grossAmount) > 0 && state.paymentDate;

  return (
    <Card>
      <h2 className="font-display text-xl mb-6">Payment Details</h2>
      <div className="flex flex-col gap-5">
        <Input
          label="Client Name"
          placeholder="e.g. Silva Roofing"
          value={state.clientName}
          onChange={set('clientName')}
        />
        <Input
          label="Project Description"
          placeholder="e.g. Google Ads Campaign"
          value={state.projectDescription}
          onChange={set('projectDescription')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Gross Invoice Amount"
            type="number"
            placeholder="0.00"
            prefix="CA$"
            value={state.grossAmount}
            onChange={set('grossAmount')}
          />
          <Input
            label="Payment Date"
            type="date"
            value={state.paymentDate}
            onChange={set('paymentDate')}
          />
        </div>

        {/* Expense toggle */}
        <div className="border border-[var(--border-default)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Attach expenses to this transaction?</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Deducted from gross before the split runs</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET', field: 'useExpenses', value: !state.useExpenses })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${state.useExpenses ? 'bg-[var(--accent-orange)]' : 'bg-[var(--bg-elevated)]'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${state.useExpenses ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {state.useExpenses && (
            <div className="mt-4">
              <Input
                label="Total Expense Amount"
                type="number"
                placeholder="0.00"
                prefix="CA$"
                value={state.expenseDeduction}
                onChange={set('expenseDeduction')}
              />
              {parseFloat(state.expenseDeduction) > 0 && parseFloat(state.grossAmount) > 0 && (
                <p className="mt-2 text-xs text-[var(--text-secondary)] font-mono">
                  Net billable: CA${(parseFloat(state.grossAmount) - parseFloat(state.expenseDeduction)).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>

        <Button onClick={onNext} disabled={!canNext} size="lg" className="w-full">
          Continue
        </Button>
      </div>
    </Card>
  );
};
