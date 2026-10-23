import type { AnalyticsQuery } from '@/graphql/generated/graphql';
import { STATUS_LABELS } from '../applications/application-options';

type StatusCount = AnalyticsQuery['analytics']['byStatus'][number];
type TimePoint = AnalyticsQuery['analytics']['applicationsOverTime'][number];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export type ChartDatum = {
  label: string;
  count: number;
};

export function toFunnelData(byStatus: StatusCount[]): ChartDatum[] {
  return byStatus.map((entry) => ({
    label: STATUS_LABELS[entry.status],
    count: entry.count,
  }));
}

export function toTimeSeries(points: TimePoint[]): ChartDatum[] {
  return points.map((point) => ({
    label: formatShortDate(point.date),
    count: point.count,
  }));
}

export function formatShortDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) {
    return isoDate;
  }

  const month = MONTH_NAMES[Number(parts[1]) - 1];
  const day = parts[2];

  return month && day ? `${day} ${month}` : isoDate;
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function formatDays(value: number | null): string {
  if (value == null) {
    return '—';
  }

  return `${Number.isInteger(value) ? value : value.toFixed(1)} days`;
}

export function offersCount(byStatus: StatusCount[]): number {
  return byStatus.find((entry) => entry.status === 'OFFER')?.count ?? 0;
}
