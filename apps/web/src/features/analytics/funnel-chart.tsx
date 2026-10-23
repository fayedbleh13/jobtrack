'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyticsQuery } from '@/graphql/generated/graphql';
import { toFunnelData } from './analytics-view-model';

/** Ordered palette that maps to the job pipeline stages. */
const BAR_COLORS = [
  'var(--color-chart-7)', // Wishlist   — neutral
  'var(--color-chart-1)', // Applied    — primary green
  'var(--color-chart-3)', // Screening  — sky
  'var(--color-chart-4)', // Interview  — amber
  'var(--color-chart-2)', // Offer      — cyan
  'var(--destructive)', // Rejected   — red
  'var(--color-muted-foreground)', // Ghosted    — muted
];

// See applications-over-time-chart.tsx for why we use these union types.
type AnyTooltipProps = TooltipContentProps<
  number | string | ReadonlyArray<number | string>,
  number | string
>;

function FunnelTooltip({ active, payload }: AnyTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as { label: string; count: number } | undefined;
  if (!entry) return null;
  const { label, count } = entry;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-sm text-popover-foreground">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {count} application{count !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export function FunnelChart({ byStatus }: { byStatus: AnalyticsQuery['analytics']['byStatus'] }) {
  const data = toFunnelData(byStatus);

  return (
    <div className="h-72 w-full" role="img" aria-label="Pipeline by status bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} strokeDasharray="4 4" stroke="var(--color-border)" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={88}
            tick={{ fontSize: 12, fill: 'var(--color-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={FunnelTooltip} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
