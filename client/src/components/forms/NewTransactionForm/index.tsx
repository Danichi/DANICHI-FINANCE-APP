import React, { useReducer } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Step1Details } from './Step1Details';
import { Step2Roles } from './Step2Roles';
import { Step3WorkSplit } from './Step3WorkSplit';
import { Step4Review } from './Step4Review';
import { Step5Confirm } from './Step5Confirm';
import { useCreateTransaction } from '../../../lib/api';
import { calculateSplit } from '../../../lib/splitCalculator';
import type { Assignment, WorkSplitMode } from '../../../types';
import { useToast } from '../../ui/Toast';

export interface FormState {
  clientName: string;
  projectDescription: string;
  grossAmount: string;
  paymentDate: string;
  expenseDeduction: string;
  useExpenses: boolean;
  clientManagerAssignment: Assignment;
  salesCommissionAssignment: Assignment;
  workSplitMode: WorkSplitMode;
  malachiWorkPercentage: number;
  danielWorkPercentage: number;
  malachiHours: string;
  danielHours: string;
}

type Action =
  | { type: 'SET'; field: keyof FormState; value: any }
  | { type: 'SET_MALACHI_PCT'; value: number }
  | { type: 'RESET' };

const initial: FormState = {
  clientName: '', projectDescription: '', grossAmount: '', paymentDate: new Date().toISOString().slice(0, 10),
  expenseDeduction: '', useExpenses: false,
  clientManagerAssignment: 'malachi', salesCommissionAssignment: 'malachi',
  workSplitMode: 'percentage', malachiWorkPercentage: 50, danielWorkPercentage: 50,
  malachiHours: '', danielHours: '',
};

function reducer(state: FormState, action: Action): FormState {
  if (action.type === 'RESET') return initial;
  if (action.type === 'SET_MALACHI_PCT') {
    return { ...state, malachiWorkPercentage: action.value, danielWorkPercentage: 100 - action.value };
  }
  return { ...state, [action.field]: action.value };
}

const STEPS = 5;

const variants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
};

export const NewTransactionForm: React.FC = () => {
  const [step, setStep] = React.useState(1);
  const [direction, setDirection] = React.useState(1);
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [state, dispatch] = useReducer(reducer, initial);
  const { mutateAsync: createTx, isPending } = useCreateTransaction();
  const { toast } = useToast();

  const goTo = (n: number) => {
    setDirection(n > step ? 1 : -1);
    setStep(n);
  };

  const splitResult = React.useMemo(() => {
    const gross = parseFloat(state.grossAmount);
    if (!gross || gross <= 0) return null;
    return calculateSplit({
      grossAmount: gross,
      expenseDeduction: state.useExpenses ? (parseFloat(state.expenseDeduction) || 0) : 0,
      clientManagerAssignment: state.clientManagerAssignment,
      salesCommissionAssignment: state.salesCommissionAssignment,
      workSplitMode: state.workSplitMode,
      malachiWorkPercentage: state.workSplitMode === 'percentage' ? state.malachiWorkPercentage : undefined,
      danielWorkPercentage: state.workSplitMode === 'percentage' ? state.danielWorkPercentage : undefined,
      malachiHours: state.workSplitMode === 'hourly' ? (parseFloat(state.malachiHours) || 0) : undefined,
      danielHours: state.workSplitMode === 'hourly' ? (parseFloat(state.danielHours) || 0) : undefined,
    });
  }, [state]);

  const handleSubmit = async () => {
    if (!splitResult) return;
    try {
      const tx = await createTx({
        clientName: state.clientName,
        projectDescription: state.projectDescription || undefined,
        grossAmount: parseFloat(state.grossAmount),
        paymentDate: state.paymentDate,
        expenseDeduction: state.useExpenses ? (parseFloat(state.expenseDeduction) || 0) : 0,
        clientManagerAssignment: state.clientManagerAssignment,
        salesCommissionAssignment: state.salesCommissionAssignment,
        workSplitMode: state.workSplitMode,
        malachiWorkPercentage: splitResult.malachiWorkPercentage,
        danielWorkPercentage: splitResult.danielWorkPercentage,
        malachiHours: state.workSplitMode === 'hourly' ? (parseFloat(state.malachiHours) || undefined) : undefined,
        danielHours: state.workSplitMode === 'hourly' ? (parseFloat(state.danielHours) || undefined) : undefined,
      });
      setSavedId(tx.id);
      setDirection(1);
      setStep(5);
      toast('Transaction saved successfully');
    } catch (e: any) {
      toast(e.message || 'Failed to save transaction', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress dots */}
      {step < 5 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: STEPS - 1 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${i + 1 < step ? 'w-2 h-2 bg-[var(--accent-orange)]' : i + 1 === step ? 'w-6 h-2 bg-[var(--accent-orange)]' : 'w-2 h-2 bg-[var(--border-strong)]'}`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {step === 1 && <Step1Details state={state} dispatch={dispatch} onNext={() => goTo(2)} />}
          {step === 2 && <Step2Roles state={state} dispatch={dispatch} onBack={() => goTo(1)} onNext={() => goTo(3)} />}
          {step === 3 && <Step3WorkSplit state={state} dispatch={dispatch} splitResult={splitResult} onBack={() => goTo(2)} onNext={() => goTo(4)} />}
          {step === 4 && <Step4Review state={state} splitResult={splitResult} onBack={() => goTo(3)} onSubmit={handleSubmit} loading={isPending} />}
          {step === 5 && <Step5Confirm savedId={savedId!} state={state} splitResult={splitResult} onReset={() => { dispatch({ type: 'RESET' }); setStep(1); }} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
