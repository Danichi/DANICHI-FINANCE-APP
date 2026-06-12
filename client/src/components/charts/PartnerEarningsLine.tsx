import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCAD, formatMonthYear } from '../../lib/formatters';

interface DataPoint {
  month: string;
  malachiCumulative: number;
  danielCumulative: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-[3px] border-[#18130e] rounded-xl p-3 shadow-card text-xs">
      <p className="label-caps mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }} />
            <span className="text-[var(--text-secondary)]">{p.name}</span>
          </div>
          <span className="font-mono font-medium" style={{ color: p.stroke }}>{formatCAD(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

interface Props {
  data: DataPoint[];
  height?: number;
}

export const PartnerEarningsLine: React.FC<Props> = ({ data, height = 280 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
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
      <Tooltip content={<CustomTooltip />} />
      <Line dataKey="malachiCumulative" name="Malachi" stroke="var(--malachi-color)" strokeWidth={2} dot={false} />
      <Line dataKey="danielCumulative" name="Daniel" stroke="var(--daniel-color)" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);
