'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AnalyticsQuery } from '@/graphql/generated/graphql';
import { toFunnelData } from './analytics-view-model';

export function FunnelChart({ byStatus }: { byStatus: AnalyticsQuery['analytics']['byStatus'] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={toFunnelData(byStatus)} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={90} />
          <Tooltip />
          <Bar dataKey="count" fill="#0f172a" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
