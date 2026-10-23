import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeApplicationSummary, makeReminder } from '../../../test/factories';
import { ApplicationCard } from './application-card';

describe('ApplicationCard', () => {
  it('renders the core details and the status label', () => {
    render(<ApplicationCard application={makeApplicationSummary()} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('$120k – $150k')).toBeInTheDocument();
    expect(screen.getByText('via LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
  });

  it('omits optional details that are not set', () => {
    render(
      <ApplicationCard
        application={makeApplicationSummary({
          id: 'a2',
          company: 'Globex',
          role: 'Fullstack Developer',
          location: null,
          salaryMin: null,
          salaryMax: null,
          source: null,
          status: 'WISHLIST',
          priority: null,
        })}
      />,
    );

    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.queryByText(/via /)).not.toBeInTheDocument();
    expect(screen.queryByText(/Next reminder/)).not.toBeInTheDocument();
  });

  it('surfaces the next reminder when one exists', () => {
    render(
      <ApplicationCard
        application={makeApplicationSummary({
          reminders: [makeReminder({ title: 'Send thank-you note' })],
        })}
      />,
    );

    expect(screen.getByText('Next reminder: Send thank-you note')).toBeInTheDocument();
  });

  it('links to the detail screen', () => {
    render(<ApplicationCard application={makeApplicationSummary()} />);

    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
      'href',
      '/applications/a1',
    );
  });
});
