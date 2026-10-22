import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AnalyticsDocument, type AnalyticsQuery } from '@/graphql/generated/graphql';
import { AnalyticsDashboard } from './analytics-dashboard';

vi.mock('./funnel-chart', () => ({
  FunnelChart: () => <div data-testid="funnel-chart" />,
}));

vi.mock('./applications-over-time-chart', () => ({
  ApplicationsOverTimeChart: () => <div data-testid="over-time-chart" />,
}));

const populated: AnalyticsQuery['analytics'] = {
  total: 8,
  responseRate: 0.7142857142857143,
  avgDaysToInterview: 18.7,
  byStatus: [
    { status: 'WISHLIST', count: 1 },
    { status: 'APPLIED', count: 2 },
    { status: 'SCREENING', count: 1 },
    { status: 'INTERVIEW', count: 1 },
    { status: 'OFFER', count: 1 },
    { status: 'REJECTED', count: 1 },
    { status: 'GHOSTED', count: 1 },
  ],
  applicationsOverTime: [{ date: '2026-10-01', count: 2 }],
};

const empty: AnalyticsQuery['analytics'] = {
  total: 0,
  responseRate: 0,
  avgDaysToInterview: null,
  byStatus: populated.byStatus.map((entry) => ({ ...entry, count: 0 })),
  applicationsOverTime: [],
};

function renderWith(summary: AnalyticsQuery['analytics']) {
  return render(
    <MockedProvider
      mocks={[
        {
          request: { query: AnalyticsDocument },
          result: { data: { analytics: summary } },
        },
      ]}
    >
      <AnalyticsDashboard />
    </MockedProvider>,
  );
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
