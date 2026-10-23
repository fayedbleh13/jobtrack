import { screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { ApplicationDocument } from '@/graphql/generated/graphql';
import { makeApplicationDetail, makeTimelineEntry } from '../../../test/factories';
import { renderWithApollo } from '../../../test/render';
import { ApplicationDetail } from './application-detail';

const application = makeApplicationDetail({
  contacts: [
    {
      id: 'c1',
      name: 'Dana Reyes',
      role: 'Engineering Manager',
      email: 'dana@acme.test',
      linkedin: null,
    },
  ],
  timeline: [makeTimelineEntry()],
});

const detailMock = {
  request: { query: ApplicationDocument, variables: { id: 'a1' } },
  result: { data: { application } },
};

describe('ApplicationDetail', () => {
  it('renders the application, its contacts and its timeline', async () => {
    renderWithApollo(<ApplicationDetail applicationId="a1" />, [detailMock]);

    expect(await screen.findByRole('heading', { name: 'Acme Corp' })).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('$120k – $150k')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('Third round scheduled.')).toBeInTheDocument();
    expect(screen.getByText('Dana Reyes')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('offers only the transitions the API allows', async () => {
    renderWithApollo(<ApplicationDetail applicationId="a1" />, [detailMock]);

    expect(await screen.findByRole('button', { name: 'Move to Offer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move to Rejected' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Move to Applied' })).not.toBeInTheDocument();
  });

  it('shows a not-found message for an unknown id', async () => {
    renderWithApollo(<ApplicationDetail applicationId="missing" />, [
      {
        request: { query: ApplicationDocument, variables: { id: 'missing' } },
        result: {
          errors: [
            new GraphQLError('Application not found', {
              extensions: { code: 'NOT_FOUND' },
            }),
          ],
        },
      },
    ]);

    expect(
      await screen.findByText('It may have been deleted, or it belongs to another account.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to applications' })).toHaveAttribute(
      'href',
      '/applications',
    );
  });
});
