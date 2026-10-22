import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ApplicationStatus } from '@/graphql/generated/graphql';
import { StatusBadge } from './status-badge';

const CASES: Array<[ApplicationStatus, string]> = [
  ['WISHLIST', 'Wishlist'],
  ['APPLIED', 'Applied'],
  ['SCREENING', 'Screening'],
  ['INTERVIEW', 'Interview'],
  ['OFFER', 'Offer'],
  ['REJECTED', 'Rejected'],
  ['GHOSTED', 'Ghosted'],
];

describe('StatusBadge', () => {
  it.each(CASES)('renders %s as "%s"', (status, label) => {
    render(<StatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
