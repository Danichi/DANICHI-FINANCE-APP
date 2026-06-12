import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCAD, formatMonthYear } from '../../lib/formatters';

interface MonthlyData {
  month: string;
  gross_revenue?: number;
  malachi_payout?: number;
  daniel_payout?: number;
  business_retained?: number;
}

interface Props {
  data: MonthlyData[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-[3px] border-[#18130e] rounded-xl p-3 shadow-card text-xs">
      <p className="label-caps mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
            <span className="text-[var(--text-secondary)]">{p.name}</span>
          </div>
          <span className="font-mono font-medium" style={{ color: p.fill }}>{formatCAD(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const MonthlyRevenueBar: React.FC<Props> = ({ data, height = 280 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} barSize={20} barCategoryGap="30%">
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
      <XAxis
        dataKey="month"
        tickFormatter={m => formatMonthYear(m + '-01').replace(',', '')}
        tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
        tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={48}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)' }} />
      <Bar dataKey="malachi_payout" name="Malachi" stackId="a" fill="var(--malachi-color)" radius={[0, 0, 0, 0]} />
      <Bar dataKey="daniel_payout" name="Daniel" stackId="a" fill="var(--daniel-color)" radius={[0, 0, 0, 0]} />
      <Bar dataKey="business_retained" name="Business" stackId="a" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
