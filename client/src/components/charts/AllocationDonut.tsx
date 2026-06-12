import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCAD } from '../../lib/formatters';

interface Segment {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border-[3px] border-[#18130e] rounded-xl p-3 shadow-card text-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.payload.color }} />
        <span className="text-[var(--text-secondary)]">{d.name}</span>
      </div>
      <p className="font-mono font-bold text-[var(--text-primary)]">{formatCAD(d.value)}</p>
    </div>
  );
};

interface Props {
  data: Segment[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export const AllocationDonut: React.FC<Props> = ({ data, height = 240, innerRadius = 60, outerRadius = 90 }) => (
  <div className="flex flex-col gap-3">
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
          <span className="text-[11px] text-[var(--text-secondary)]">{d.name}</span>
        </div>
      ))}
    </div>
  </div>
);
