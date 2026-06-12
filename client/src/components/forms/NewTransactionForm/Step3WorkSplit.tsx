import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Slider } from '../../ui/Slider';
import { Toggle } from '../../ui/Toggle';
import { Input } from '../../ui/Input';
import type { FormState } from './index';
import type { SplitResult } from '../../../types';
import { formatCAD } from '../../../lib/formatters';

interface Props {
  state: FormState;
  dispatch: React.Dispatch<any>;
  splitResult: SplitResult | null;
  onBack: () => void;
  onNext: () => void;
}

export const Step3WorkSplit: React.FC<Props> = ({ state, dispatch, splitResult, onBack, onNext }) => {
  const workPool = splitResult?.workPool ?? 0;

  const mHrs = parseFloat(state.malachiHours) || 0;
  const dHrs = parseFloat(state.danielHours) || 0;
  const totalHrs = mHrs + dHrs;
  const hourlyMPct = totalHrs > 0 ? (mHrs / totalHrs) * 100 : 50;
  const hourlyDPct = 100 - hourlyMPct;

  const displayMPct = state.workSplitMode === 'hourly' ? hourlyMPct : state.malachiWorkPercentage;
  const displayDPct = state.workSplitMode === 'hourly' ? hourlyDPct : state.danielWorkPercentage;

  const mWorkPay = splitResult?.malachiWorkPayout ?? 0;
  const dWorkPay = splitResult?.danielWorkPayout ?? 0;

  return (
    <Card>
      <h2 className="font-display text-xl mb-2">Work Split</h2>
      {workPool > 0 && (
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          Splitting <span className="font-mono font-bold text-[var(--text-primary)]">{formatCAD(workPool)}</span> between you
        </p>
      )}

      <Toggle
        options={[
          { value: 'percentage', label: 'By Percentage' },
          { value: 'hourly', label: 'By Hours' },
        ]}
        value={state.workSplitMode}
        onChange={v => dispatch({ type: 'SET', field: 'workSplitMode', value: v })}
        className="mb-6"
      />

      {state.workSplitMode === 'percentage' ? (
        <div className="flex flex-col gap-5">
          <Slider
            label="Malachi"
            value={state.malachiWorkPercentage}
            onChange={v => dispatch({ type: 'SET_MALACHI_PCT', value: v })}
            color="var(--malachi-color)"
            displayValue={`${state.malachiWorkPercentage}% — ${formatCAD(mWorkPay)}`}
          />
          <Slider
            label="Daniel"
            value={state.danielWorkPercentage}
            onChange={v => dispatch({ type: 'SET_MALACHI_PCT', value: 100 - v })}
            color="var(--daniel-color)"
            displayValue={`${state.danielWorkPercentage}% — ${formatCAD(dWorkPay)}`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Malachi Hours"
              type="number"
              placeholder="0"
              suffix="hrs"
              value={state.malachiHours}
              onChange={e => dispatch({ type: 'SET', field: 'malachiHours', value: e.target.value })}
            />
            {mWorkPay > 0 && (
              <p className="mt-1.5 text-xs font-mono text-[var(--malachi-color)]">
                {displayMPct.toFixed(0)}% → {formatCAD(mWorkPay)}
              </p>
            )}
          </div>
          <div>
            <Input
              label="Daniel Hours"
              type="number"
              placeholder="0"
              suffix="hrs"
              value={state.danielHours}
              onChange={e => dispatch({ type: 'SET', field: 'danielHours', value: e.target.value })}
            />
            {dWorkPay > 0 && (
              <p className="mt-1.5 text-xs font-mono text-[var(--daniel-color)]">
                {displayDPct.toFixed(0)}% → {formatCAD(dWorkPay)}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-6">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1" disabled={!splitResult}>Continue</Button>
      </div>
    </Card>
  );
};
