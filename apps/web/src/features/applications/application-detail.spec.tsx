import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApplicationDocument, type ApplicationQuery } from '@/graphql/generated/graphql';
import { ApplicationDetail } from './application-detail';

const application: ApplicationQuery['application'] = {
  id: 'a1',
  company: 'Acme Corp',
  role: 'Senior Frontend Engineer',
  location: 'Remote',
  salaryMin: 120000,
  salaryMax: 150000,
  jobUrl: null,
  source: 'LinkedIn',
  status: 'INTERVIEW',
  priority: 3,
  appliedAt: '2026-10-01T12:00:00.000Z',
  notes: 'Third round scheduled.',
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-02T12:00:00.000Z',
  allowedNextStatuses: ['OFFER', 'REJECTED', 'GHOSTED'],
  contacts: [
    {
      id: 'c1',
      name: 'Dana Reyes',
      role: 'Engineering Manager',
      email: 'dana@acme.test',
      linkedin: null,
    },
  ],
  timeline: [
    {
      id: 't1',
      fromStatus: null,
      toStatus: 'WISHLIST',
      at: '2026-10-01T12:00:00.000Z',
      note: null,
    },
  ],
  reminders: [],
};

describe('ApplicationDetail', () => {
  it('renders the application, its contacts and its timeline', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: { query: ApplicationDocument, variables: { id: 'a1' } },
            result: { data: { application } },
          },
        ]}
      >
        <ApplicationDetail applicationId="a1" />
      </MockedProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Acme Corp' })).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('$120k – $150k')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('Third round scheduled.')).toBeInTheDocument();
    expect(screen.getByText('Dana Reyes')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('offers only the transitions the API allows', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: { query: ApplicationDocument, variables: { id: 'a1' } },
            result: { data: { application } },
          },
        ]}
      >
        <ApplicationDetail applicationId="a1" />
      </MockedProvider>,
    );

    expect(await screen.findByRole('button', { name: 'Move to Offer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move to Rejected' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Move to Applied' })).not.toBeInTheDocument();
  });

  it('shows a not-found message for an unknown id', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: { query: ApplicationDocument, variables: { id: 'missing' } },
            error: new Error('Application not found'),
          },
        ]}
      >
        <ApplicationDetail applicationId="missing" />
      </MockedProvider>,
    );

    expect(
      await screen.findByText('It may have been deleted, or it belongs to another account.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to applications' })).toHaveAttribute(
      'href',
      '/applications',
    );
  });
});
