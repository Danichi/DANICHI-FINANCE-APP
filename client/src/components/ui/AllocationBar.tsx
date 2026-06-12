import React from 'react';
import { cn } from '../../lib/utils';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface AllocationBarProps {
  segments: Segment[];
  height?: number;
  showLabels?: boolean;
  className?: string;
}

export const AllocationBar: React.FC<AllocationBarProps> = ({
  segments, height = 8, showLabels = false, className,
}) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className="flex w-full overflow-hidden rounded-full"
        style={{ height }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            title={`${seg.label}: ${((seg.value / total) * 100).toFixed(1)}%`}
            style={{
              width: `${(seg.value / total) * 100}%`,
              backgroundColor: seg.color,
              transition: 'width 0.4s ease',
            }}
          />
        ))}
      </div>
      {showLabels && (
        <div className="flex flex-wrap gap-3">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[11px] text-[var(--text-secondary)]">
                {seg.label} {((seg.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
