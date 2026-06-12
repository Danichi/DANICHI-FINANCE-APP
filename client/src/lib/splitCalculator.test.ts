import { describe, it, expect } from 'vitest';
import { calculateSplit } from './splitCalculator';

describe('calculateSplit', () => {
  it('basic_split_all_50_50', () => {
    const r = calculateSplit({
      grossAmount: 1000,
      clientManagerAssignment: 'split',
      salesCommissionAssignment: 'split',
      workSplitMode: 'percentage',
      malachiWorkPercentage: 50,
      danielWorkPercentage: 50,
    });
    expect(r.businessProfitReserve).toBe(100);
    expect(r.clientManagementFee).toBe(100);
    expect(r.salesCommission).toBe(200);
    expect(r.workPool).toBe(600);
    expect(r.malachiWorkPayout).toBe(300);
    expect(r.danielWorkPayout).toBe(300);
    expect(r.malachiTotalPayout).toBe(450); // 50cm + 100sales + 300work
    expect(r.danielTotalPayout).toBe(450);
    // total check
    const total = r.malachiTotalPayout + r.danielTotalPayout + r.businessTotalRetained;
    expect(total).toBe(1000);
  });

  it('malachi_everything', () => {
    const r = calculateSplit({
      grossAmount: 2000,
      clientManagerAssignment: 'malachi',
      salesCommissionAssignment: 'malachi',
      workSplitMode: 'percentage',
      malachiWorkPercentage: 100,
      danielWorkPercentage: 0,
    });
    expect(r.clientManagementToMalachi).toBe(200);
    expect(r.clientManagementToDaniel).toBe(0);
    expect(r.salesCommissionToMalachi).toBe(400);
    expect(r.salesCommissionToDaniel).toBe(0);
    expect(r.danielWorkPayout).toBe(0);
    expect(r.malachiWorkPayout).toBe(1200);
    expect(r.malachiTotalPayout).toBe(1800);
    expect(r.danielTotalPayout).toBe(0);
    expect(r.businessTotalRetained).toBe(200);
    const total = r.malachiTotalPayout + r.danielTotalPayout + r.businessTotalRetained;
    expect(total).toBe(2000);
  });

  it('percentage_vs_hourly_same_ratio', () => {
    const byPercent = calculateSplit({
      grossAmount: 5000,
      clientManagerAssignment: 'split',
      salesCommissionAssignment: 'split',
      workSplitMode: 'percentage',
      malachiWorkPercentage: 70,
      danielWorkPercentage: 30,
    });
    const byHours = calculateSplit({
      grossAmount: 5000,
      clientManagerAssignment: 'split',
      salesCommissionAssignment: 'split',
      workSplitMode: 'hourly',
      malachiHours: 14,
      danielHours: 6,
    });
    expect(byPercent.malachiWorkPayout).toBe(byHours.malachiWorkPayout);
    expect(byPercent.danielWorkPayout).toBe(byHours.danielWorkPayout);
    expect(byPercent.malachiTotalPayout).toBe(byHours.malachiTotalPayout);
    expect(byPercent.danielTotalPayout).toBe(byHours.danielTotalPayout);
  });

  it('expense_deduction', () => {
    const r = calculateSplit({
      grossAmount: 5000,
      expenseDeduction: 500,
      clientManagerAssignment: 'split',
      salesCommissionAssignment: 'split',
      workSplitMode: 'percentage',
      malachiWorkPercentage: 50,
      danielWorkPercentage: 50,
    });
    expect(r.netAmount).toBe(4500);
    expect(r.businessProfitReserve).toBe(450);
    expect(r.clientManagementFee).toBe(450);
    expect(r.salesCommission).toBe(900);
    expect(r.workPool).toBe(2700); // 60% of 4500 net
    // partner + business totals sum to netAmount (expenses are pre-split deductions)
    expect(r.malachiTotalPayout + r.danielTotalPayout + r.businessTotalRetained).toBe(4500);
  });

  it('worked_example — $5000, Malachi cm, Daniel sales, 14/6 hrs', () => {
    const r = calculateSplit({
      grossAmount: 5000,
      clientManagerAssignment: 'malachi',
      salesCommissionAssignment: 'daniel',
      workSplitMode: 'hourly',
      malachiHours: 14,
      danielHours: 6,
    });
    expect(r.businessProfitReserve).toBe(500);
    expect(r.clientManagementFee).toBe(500);
    expect(r.clientManagementToMalachi).toBe(500);
    expect(r.clientManagementToDaniel).toBe(0);
    expect(r.salesCommission).toBe(1000);
    expect(r.salesCommissionToMalachi).toBe(0);
    expect(r.salesCommissionToDaniel).toBe(1000);
    expect(r.workPool).toBe(3000);
    expect(r.malachiWorkPercentage).toBe(70);
    expect(r.danielWorkPercentage).toBe(30);
    expect(r.malachiWorkPayout).toBe(2100);
    expect(r.danielWorkPayout).toBe(900);
    expect(r.malachiTotalPayout).toBe(2600);
    expect(r.danielTotalPayout).toBe(1900);
    expect(r.businessTotalRetained).toBe(500);
    const total = r.malachiTotalPayout + r.danielTotalPayout + r.businessTotalRetained;
    expect(total).toBe(5000);
  });

  it('rounding_remainder — total always equals gross', () => {
    // Use an amount that doesn't divide evenly
    const r = calculateSplit({
      grossAmount: 333.33,
      clientManagerAssignment: 'malachi',
      salesCommissionAssignment: 'daniel',
      workSplitMode: 'percentage',
      malachiWorkPercentage: 33,
      danielWorkPercentage: 67,
    });
    const total = r.malachiTotalPayout + r.danielTotalPayout + r.businessTotalRetained;
    expect(total).toBe(r.grossAmount);
  });
});
