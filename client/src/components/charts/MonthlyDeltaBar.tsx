import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { formatCAD, formatMonthYear } from '../../lib/formatters';

interface DataPoint {
  month: string;
  delta: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="bg-white border-[3px] border-[#18130e] rounded-xl p-3 shadow-card text-xs">
      <p className="label-caps mb-1">{label}</p>
      <p className="font-mono font-bold" style={{ color: val >= 0 ? 'var(--malachi-color)' : 'var(--daniel-color)' }}>
        {val >= 0 ? `Malachi +${formatCAD(val)}` : `Daniel +${formatCAD(Math.abs(val))}`}
      </p>
    </div>
  );
};

interface Props {
  data: DataPoint[];
  height?: number;
}

export const MonthlyDeltaBar: React.FC<Props> = ({ data, height = 240 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} barSize={16}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
      <XAxis
        dataKey="month"
        tickFormatter={m => formatMonthYear(m + '-01').replace(',', '')}
        tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tickFormatter={v => `$${Math.abs(v / 1000).toFixed(0)}K`}
        tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={44}
      />
      <ReferenceLine y={0} stroke="var(--border-strong)" />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)' }} />
      <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.delta >= 0 ? 'var(--malachi-color)' : 'var(--daniel-color)'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
