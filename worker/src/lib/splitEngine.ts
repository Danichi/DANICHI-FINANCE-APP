type Assignment = 'malachi' | 'daniel' | 'split';
type WorkSplitMode = 'percentage' | 'hourly';

export interface SplitRatios {
  businessReservePct: number;
  clientMgmtPct: number;
  salesCommissionPct: number;
}

export const DEFAULT_RATIOS: SplitRatios = {
  businessReservePct: 10,
  clientMgmtPct: 10,
  salesCommissionPct: 20,
};

export interface SplitInput {
  grossAmount: number;
  expenseDeduction?: number;
  clientManagerAssignment: Assignment;
  salesCommissionAssignment: Assignment;
  workSplitMode: WorkSplitMode;
  malachiWorkPercentage?: number;
  danielWorkPercentage?: number;
  malachiHours?: number;
  danielHours?: number;
  ratios?: Partial<SplitRatios>;
}

export interface SplitResult {
  grossAmount: number;
  netAmount: number;
  expenseDeduction: number;
  businessProfitReserve: number;
  clientManagementFee: number;
  clientManagementToMalachi: number;
  clientManagementToDaniel: number;
  salesCommission: number;
  salesCommissionToMalachi: number;
  salesCommissionToDaniel: number;
  workPool: number;
  malachiWorkPercentage: number;
  danielWorkPercentage: number;
  malachiWorkPayout: number;
  danielWorkPayout: number;
  malachiTotalPayout: number;
  danielTotalPayout: number;
  businessTotalRetained: number;
  remainder: number;
  explanation: string;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

function assignToPartners(amount: number, assignment: Assignment) {
  const half = round2(amount / 2);
  if (assignment === 'malachi') return { toMalachi: amount, toDaniel: 0 };
  if (assignment === 'daniel') return { toMalachi: 0, toDaniel: amount };
  return { toMalachi: half + round2(amount - half * 2), toDaniel: half };
}

export function calculateSplit(input: SplitInput): SplitResult {
  const { grossAmount, expenseDeduction = 0, clientManagerAssignment, salesCommissionAssignment,
    workSplitMode, malachiWorkPercentage, danielWorkPercentage, malachiHours, danielHours } = input;

  const ratios: SplitRatios = {
    businessReservePct: input.ratios?.businessReservePct ?? DEFAULT_RATIOS.businessReservePct,
    clientMgmtPct: input.ratios?.clientMgmtPct ?? DEFAULT_RATIOS.clientMgmtPct,
    salesCommissionPct: input.ratios?.salesCommissionPct ?? DEFAULT_RATIOS.salesCommissionPct,
  };

  const netAmount = round2(grossAmount - expenseDeduction);
  const businessProfitReserve = round2(netAmount * (ratios.businessReservePct / 100));
  const clientManagementFee = round2(netAmount * (ratios.clientMgmtPct / 100));
  const salesCommission = round2(netAmount * (ratios.salesCommissionPct / 100));
  const workPool = round2(netAmount - businessProfitReserve - clientManagementFee - salesCommission);

  const { toMalachi: clientManagementToMalachi, toDaniel: clientManagementToDaniel } =
    assignToPartners(clientManagementFee, clientManagerAssignment);
  const { toMalachi: salesCommissionToMalachi, toDaniel: salesCommissionToDaniel } =
    assignToPartners(salesCommission, salesCommissionAssignment);

  let mPct: number, dPct: number;
  if (workSplitMode === 'hourly') {
    const mHrs = malachiHours ?? 0, dHrs = danielHours ?? 0, total = mHrs + dHrs;
    mPct = total === 0 ? 50 : round2((mHrs / total) * 100);
    dPct = round2(100 - mPct);
  } else {
    mPct = malachiWorkPercentage ?? 50;
    dPct = danielWorkPercentage ?? round2(100 - mPct);
  }

  const malachiWorkPayout = round2(workPool * (mPct / 100));
  const danielWorkPayout = round2(workPool * (dPct / 100));
  const malachiTotalPayout = round2(clientManagementToMalachi + salesCommissionToMalachi + malachiWorkPayout);
  const danielTotalPayout = round2(clientManagementToDaniel + salesCommissionToDaniel + danielWorkPayout);

  const allocated = round2(businessProfitReserve + malachiTotalPayout + danielTotalPayout);
  const remainder = round2(netAmount - allocated);
  const businessTotalRetained = round2(businessProfitReserve + remainder);

  const explanation = buildExplanation(input, { netAmount, businessProfitReserve, clientManagementToMalachi,
    clientManagementToDaniel, salesCommissionToMalachi, salesCommissionToDaniel, workPool, mPct, dPct,
    malachiWorkPayout, danielWorkPayout, malachiTotalPayout, danielTotalPayout, businessTotalRetained, ratios });

  return { grossAmount, netAmount, expenseDeduction, businessProfitReserve, clientManagementFee,
    clientManagementToMalachi, clientManagementToDaniel, salesCommission, salesCommissionToMalachi,
    salesCommissionToDaniel, workPool, malachiWorkPercentage: mPct, danielWorkPercentage: dPct,
    malachiWorkPayout, danielWorkPayout, malachiTotalPayout, danielTotalPayout, businessTotalRetained,
    remainder, explanation };
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(n);
}

function buildExplanation(input: SplitInput, r: Record<string, unknown> & { ratios: SplitRatios }): string {
  const { grossAmount, expenseDeduction = 0, clientManagerAssignment, salesCommissionAssignment, workSplitMode, malachiHours, danielHours } = input;
  const ratios = r.ratios;
  const parts: string[] = [];
  const baseAmt = (expenseDeduction as number) > 0
    ? `After deducting ${fmt(expenseDeduction as number)} in expenses, the net billable amount of ${fmt(r.netAmount as number)} was split as follows:`
    : `This ${fmt(grossAmount)} payment was split as follows:`;
  parts.push(baseAmt);
  parts.push(`${fmt(r.businessProfitReserve as number)} (${ratios.businessReservePct}%) went to the Business Profit Reserve.`);
  if (clientManagerAssignment === 'split') {
    parts.push(`${ratios.clientMgmtPct}% in client management fees were split equally (${fmt(r.clientManagementToMalachi as number)} each).`);
  } else {
    parts.push(`${fmt((r.clientManagementToMalachi as number) + (r.clientManagementToDaniel as number))} (${ratios.clientMgmtPct}%) went to ${clientManagerAssignment === 'malachi' ? 'Malachi' : 'Daniel'} for managing the client relationship.`);
  }
  if (salesCommissionAssignment === 'split') {
    parts.push(`${ratios.salesCommissionPct}% in sales commission was split equally (${fmt(r.salesCommissionToMalachi as number)} each).`);
  } else {
    parts.push(`${fmt((r.salesCommissionToMalachi as number) + (r.salesCommissionToDaniel as number))} (${ratios.salesCommissionPct}%) went to ${salesCommissionAssignment === 'malachi' ? 'Malachi' : 'Daniel'} as sales commission.`);
  }
  const workPct = 100 - ratios.businessReservePct - ratios.clientMgmtPct - ratios.salesCommissionPct;
  const workBasis = workSplitMode === 'hourly'
    ? `based on hours logged (Malachi: ${malachiHours ?? 0}hrs, Daniel: ${danielHours ?? 0}hrs)`
    : `based on a ${r.mPct}/${r.dPct} percentage split`;
  parts.push(`The remaining ${fmt(r.workPool as number)} (${workPct}% work pool) was divided ${workBasis}, giving Malachi ${fmt(r.malachiWorkPayout as number)} and Daniel ${fmt(r.danielWorkPayout as number)}.`);
  parts.push(`Malachi's total: ${fmt(r.malachiTotalPayout as number)}. Daniel's total: ${fmt(r.danielTotalPayout as number)}. Business retained: ${fmt(r.businessTotalRetained as number)}.`);
  return parts.join(' ');
}
