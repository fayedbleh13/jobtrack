'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyticsQuery } from '@/graphql/generated/graphql';
import { toTimeSeries } from './analytics-view-model';

// TooltipContentProps uses ValueType = number|string|ReadonlyArray<number|string>
// and NameType = number|string — using those unions directly avoids the
// covariance mismatch with Recharts' internal ContentType generic.
type AnyTooltipProps = TooltipContentProps<
  number | string | ReadonlyArray<number | string>,
  number | string
>;

function TimeTooltip({ active, payload, label }: AnyTooltipProps) {
  if (!active || !payload?.length) return null;
  const count = payload[0]?.value;
  if (count == null || typeof count !== 'number') return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-sm text-popover-foreground">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {count} application{count !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export function ApplicationsOverTimeChart({
  points,
}: {
  points: AnalyticsQuery['analytics']['applicationsOverTime'];
}) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Applications over time area chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={toTimeSeries(points)} margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="aotGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={TimeTooltip}
            cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-chart-1)"
            strokeWidth={2.5}
            fill="url(#aotGradient)"
            dot={{ r: 3, fill: 'var(--color-chart-1)', strokeWidth: 0 }}
            activeDot={{
              r: 5,
              fill: 'var(--color-chart-1)',
              strokeWidth: 2,
              stroke: 'var(--color-card)',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
