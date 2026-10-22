import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusTimeline, type TimelineEntry } from './status-timeline';

const entries: TimelineEntry[] = [
  {
    id: 't1',
    fromStatus: null,
    toStatus: 'WISHLIST',
    at: '2026-10-01T12:00:00.000Z',
    note: null,
  },
  {
    id: 't2',
    fromStatus: 'WISHLIST',
    toStatus: 'APPLIED',
    at: '2026-10-02T12:00:00.000Z',
    note: 'Applied via board',
  },
  {
    id: 't3',
    fromStatus: 'APPLIED',
    toStatus: 'INTERVIEW',
    at: '2026-10-05T12:00:00.000Z',
    note: null,
  },
];

describe('StatusTimeline', () => {
  it('shows an empty state when nothing is recorded', () => {
    render(<StatusTimeline entries={[]} />);

    expect(screen.getByText('No status changes recorded yet.')).toBeInTheDocument();
  });

  it('renders every transition in the order given', () => {
    render(<StatusTimeline entries={entries} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Wishlist');
    expect(items[2]).toHaveTextContent('Applied');
    expect(items[2]).toHaveTextContent('Interview');
  });

  it('includes notes recorded on a transition', () => {
    render(<StatusTimeline entries={entries} />);

    expect(screen.getByText('Applied via board')).toBeInTheDocument();
  });

  it('does not show a previous status for the initial event', () => {
    render(<StatusTimeline entries={entries} />);

    expect(screen.getAllByRole('listitem')[0]).not.toHaveTextContent('→');
  });

  it('formats each timestamp', () => {
    render(<StatusTimeline entries={entries} />);

    expect(screen.getByText('01 Oct 2026')).toBeInTheDocument();
    expect(screen.getByText('05 Oct 2026')).toBeInTheDocument();
  });
});
