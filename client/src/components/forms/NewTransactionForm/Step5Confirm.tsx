import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import type { FormState } from './index';
import type { SplitResult } from '../../../types';
import { formatCAD } from '../../../lib/formatters';

interface Props {
  savedId: string;
  state: FormState;
  splitResult: SplitResult | null;
  onReset: () => void;
}

export const Step5Confirm: React.FC<Props> = ({ savedId, state, splitResult: r, onReset }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="w-20 h-20 rounded-full bg-[var(--green-dim)] flex items-center justify-center">
          <CheckCircle size={40} className="text-[var(--green)]" />
        </div>
      </motion.div>

      <div className="text-center">
        <h2 className="font-display text-2xl text-[var(--text-primary)] mb-1">Transaction Saved</h2>
        <p className="text-[var(--text-secondary)] text-sm">{state.clientName} · {formatCAD(parseFloat(state.grossAmount))}</p>
      </div>

      {r && (
        <Card className="w-full">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Malachi', amount: r.malachiTotalPayout, color: 'var(--malachi-color)' },
              { label: 'Daniel', amount: r.danielTotalPayout, color: 'var(--daniel-color)' },
              { label: 'Business', amount: r.businessTotalRetained, color: 'var(--accent-amber)' },
            ].map(item => (
              <div key={item.label}>
                <p className="label-caps mb-1">{item.label}</p>
                <p className="font-mono text-xl font-bold" style={{ color: item.color }}>{formatCAD(item.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2 w-full">
        <Button size="lg" className="w-full" onClick={() => navigate(`/transactions/${savedId}`)}>
          View Transaction
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={onReset}>
          Log Another Payment
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
