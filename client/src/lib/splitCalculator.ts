import type { SplitInput, SplitResult, Assignment } from '../types';

const round2 = (n: number): number => Math.round(n * 100) / 100;

function assignToPartners(
  amount: number,
  assignment: Assignment
): { toMalachi: number; toDaniel: number } {
  const half = round2(amount / 2);
  if (assignment === 'malachi') return { toMalachi: amount, toDaniel: 0 };
  if (assignment === 'daniel') return { toMalachi: 0, toDaniel: amount };
  // 'split' — give each half, give any rounding cent to malachi
  return { toMalachi: half + round2(amount - half * 2), toDaniel: half };
}

export function calculateSplit(input: SplitInput): SplitResult {
  const {
    grossAmount,
    expenseDeduction = 0,
    clientManagerAssignment,
    salesCommissionAssignment,
    workSplitMode,
    malachiWorkPercentage,
    danielWorkPercentage,
    malachiHours,
    danielHours,
  } = input;

  const netAmount = round2(grossAmount - expenseDeduction);

  const businessProfitReserve = round2(netAmount * 0.1);
  const clientManagementFee = round2(netAmount * 0.1);
  const salesCommission = round2(netAmount * 0.2);
  const workPool = round2(netAmount - businessProfitReserve - clientManagementFee - salesCommission);

  const { toMalachi: clientManagementToMalachi, toDaniel: clientManagementToDaniel } =
    assignToPartners(clientManagementFee, clientManagerAssignment);

  const { toMalachi: salesCommissionToMalachi, toDaniel: salesCommissionToDaniel } =
    assignToPartners(salesCommission, salesCommissionAssignment);

  // Work split
  let mPct: number;
  let dPct: number;

  if (workSplitMode === 'hourly') {
    const mHrs = malachiHours ?? 0;
    const dHrs = danielHours ?? 0;
    const total = mHrs + dHrs;
    if (total === 0) {
      mPct = 50;
      dPct = 50;
    } else {
      mPct = round2((mHrs / total) * 100);
      dPct = round2(100 - mPct);
    }
  } else {
    mPct = malachiWorkPercentage ?? 50;
    dPct = danielWorkPercentage ?? round2(100 - mPct);
  }

  const malachiWorkPayout = round2(workPool * (mPct / 100));
  const danielWorkPayout = round2(workPool * (dPct / 100));

  const malachiTotalPayout = round2(clientManagementToMalachi + salesCommissionToMalachi + malachiWorkPayout);
  const danielTotalPayout = round2(clientManagementToDaniel + salesCommissionToDaniel + danielWorkPayout);

  // Remainder: any rounding delta from the net goes to business
  const allocated = round2(businessProfitReserve + malachiTotalPayout + danielTotalPayout);
  const remainder = round2(netAmount - allocated);
  const businessTotalRetained = round2(businessProfitReserve + remainder);

  const explanation = generateExplanation({
    grossAmount,
    expenseDeduction,
    netAmount,
    clientManagerAssignment,
    salesCommissionAssignment,
    clientManagementToMalachi,
    clientManagementToDaniel,
    salesCommissionToMalachi,
    salesCommissionToDaniel,
    workPool,
    workSplitMode,
    malachiHours,
    danielHours,
    mPct,
    dPct,
    malachiWorkPayout,
    danielWorkPayout,
    malachiTotalPayout,
    danielTotalPayout,
    businessProfitReserve,
    businessTotalRetained,
  });

  return {
    grossAmount,
    netAmount,
    expenseDeduction,
    businessProfitReserve,
    clientManagementFee,
    clientManagementToMalachi,
    clientManagementToDaniel,
    salesCommission,
    salesCommissionToMalachi,
    salesCommissionToDaniel,
    workPool,
    malachiWorkPercentage: mPct,
    danielWorkPercentage: dPct,
    malachiWorkPayout,
    danielWorkPayout,
    malachiTotalPayout,
    danielTotalPayout,
    businessTotalRetained,
    remainder,
    explanation,
  };
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(n);
}

function partnerName(assignment: Assignment, role: 'clientMgmt' | 'sales'): string {
  if (assignment === 'malachi') return 'Malachi';
  if (assignment === 'daniel') return 'Daniel';
  return role === 'clientMgmt' ? 'both partners (50/50)' : 'both partners (50/50)';
}

interface ExplanationInput {
  grossAmount: number;
  expenseDeduction: number;
  netAmount: number;
  clientManagerAssignment: Assignment;
  salesCommissionAssignment: Assignment;
  clientManagementToMalachi: number;
  clientManagementToDaniel: number;
  salesCommissionToMalachi: number;
  salesCommissionToDaniel: number;
  workPool: number;
  workSplitMode: WorkSplitMode;
  malachiHours?: number;
  danielHours?: number;
  mPct: number;
  dPct: number;
  malachiWorkPayout: number;
  danielWorkPayout: number;
  malachiTotalPayout: number;
  danielTotalPayout: number;
  businessProfitReserve: number;
  businessTotalRetained: number;
}

type WorkSplitMode = 'percentage' | 'hourly';

function generateExplanation(e: ExplanationInput): string {
  const parts: string[] = [];

  const baseAmt = e.expenseDeduction > 0
    ? `After deducting ${fmt(e.expenseDeduction)} in expenses, the net billable amount of ${fmt(e.netAmount)} was split as follows:`
    : `This ${fmt(e.grossAmount)} payment was split as follows:`;
  parts.push(baseAmt);

  parts.push(`${fmt(e.businessProfitReserve)} went to the Business Profit Reserve.`);

  if (e.clientManagerAssignment === 'split') {
    parts.push(`${fmt(e.clientManagementToMalachi + e.clientManagementToDaniel)} in client management fees were split equally between Malachi and Daniel (${fmt(e.clientManagementToMalachi)} each).`);
  } else {
    parts.push(`${fmt(e.clientManagementToMalachi + e.clientManagementToDaniel)} went to ${partnerName(e.clientManagerAssignment, 'clientMgmt')} for managing the client relationship.`);
  }

  if (e.salesCommissionAssignment === 'split') {
    parts.push(`${fmt(e.salesCommissionToMalachi + e.salesCommissionToDaniel)} in sales commission was split equally between Malachi and Daniel (${fmt(e.salesCommissionToMalachi)} each).`);
  } else {
    parts.push(`${fmt(e.salesCommissionToMalachi + e.salesCommissionToDaniel)} went to ${partnerName(e.salesCommissionAssignment, 'sales')} as sales commission for closing this deal.`);
  }

  const workBasis = e.workSplitMode === 'hourly'
    ? `based on hours logged (Malachi: ${e.malachiHours ?? 0}hrs, Daniel: ${e.danielHours ?? 0}hrs)`
    : `based on a ${e.mPct}/${e.dPct} percentage split`;

  parts.push(`The remaining ${fmt(e.workPool)} work pool was divided ${workBasis}, giving Malachi ${fmt(e.malachiWorkPayout)} and Daniel ${fmt(e.danielWorkPayout)}.`);

  parts.push(`Malachi's total take-home: ${fmt(e.malachiTotalPayout)}. Daniel's total take-home: ${fmt(e.danielTotalPayout)}. Business retained: ${fmt(e.businessTotalRetained)}.`);

  return parts.join(' ');
}
