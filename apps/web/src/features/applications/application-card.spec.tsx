import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApplicationCard, type ApplicationSummary } from './application-card';

const application: ApplicationSummary = {
  id: 'a1',
  company: 'Acme Corp',
  role: 'Senior Frontend Engineer',
  location: 'Remote',
  salaryMin: 120000,
  salaryMax: 150000,
  source: 'LinkedIn',
  status: 'INTERVIEW',
  priority: 3,
  appliedAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-02T12:00:00.000Z',
  contacts: [],
  reminders: [],
};

const minimal: ApplicationSummary = {
  id: 'a2',
  company: 'Globex',
  role: 'Fullstack Developer',
  location: null,
  salaryMin: null,
  salaryMax: null,
  source: null,
  status: 'WISHLIST',
  priority: null,
  appliedAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-02T12:00:00.000Z',
  contacts: [],
  reminders: [],
};

describe('ApplicationCard', () => {
  it('renders the core details and the status label', () => {
    render(<ApplicationCard application={application} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('$120k – $150k')).toBeInTheDocument();
    expect(screen.getByText('via LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
  });

  it('omits optional details that are not set', () => {
    render(<ApplicationCard application={minimal} />);

    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.queryByText(/via /)).not.toBeInTheDocument();
    expect(screen.queryByText(/Next reminder/)).not.toBeInTheDocument();
  });

  it('surfaces the next reminder when one exists', () => {
    render(
      <ApplicationCard
        application={{
          ...application,
          reminders: [
            {
              id: 'r1',
              title: 'Send thank-you note',
              dueAt: '2026-10-06T12:00:00.000Z',
              done: false,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Next reminder: Send thank-you note')).toBeInTheDocument();
  });

  it('links to the detail screen', () => {
    render(<ApplicationCard application={application} />);

    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
      'href',
      '/applications/a1',
    );
  });
});
