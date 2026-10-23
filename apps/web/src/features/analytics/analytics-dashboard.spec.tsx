import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AnalyticsDocument } from '@/graphql/generated/graphql';
import { makeAnalytics } from '../../../test/factories';
import { renderWithApollo } from '../../../test/render';
import { AnalyticsDashboard } from './analytics-dashboard';

vi.mock('./funnel-chart', () => ({
  FunnelChart: () => <div data-testid="funnel-chart" />,
}));

vi.mock('./applications-over-time-chart', () => ({
  ApplicationsOverTimeChart: () => <div data-testid="over-time-chart" />,
}));

const populated = makeAnalytics();

const empty = makeAnalytics({
  total: 0,
  responseRate: 0,
  avgDaysToInterview: null,
  byStatus: populated.byStatus.map((entry) => ({ ...entry, count: 0 })),
  applicationsOverTime: [],
});

function renderWith(summary: typeof populated) {
  return renderWithApollo(<AnalyticsDashboard />, [
    {
      request: { query: AnalyticsDocument },
      result: { data: { analytics: summary } },
    },
  ]);
}

describe('AnalyticsDashboard', () => {
  it('renders the KPI values from the summary', async () => {
    renderWith(populated);

    expect(await screen.findByText('71%')).toBeInTheDocument();
    expect(screen.getByText('18.7 days')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Offers')).toBeInTheDocument();
  });

  it('renders both charts for a populated summary', async () => {
    renderWith(populated);

    expect(await screen.findByTestId('funnel-chart')).toBeInTheDocument();
    expect(screen.getByTestId('over-time-chart')).toBeInTheDocument();
  });

  it('shows an empty state instead of empty charts for a new account', async () => {
    renderWith(empty);

    expect(await screen.findByText('No data yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to applications' })).toHaveAttribute(
      'href',
      '/applications',
    );
    expect(screen.queryByTestId('funnel-chart')).not.toBeInTheDocument();
  });
});
