import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginDocument } from '@/graphql/generated/graphql';
import { LoginForm } from './login-form';

const { replace, refresh } = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}));

const credentials = {
  input: { email: 'demo@jobtrack.dev', password: 'password123' },
};

describe('LoginForm', () => {
  it('signs in and redirects to the applications board', async () => {
    const mocks = [
      {
        request: { query: LoginDocument, variables: credentials },
        result: {
          data: {
            login: { user: { id: 'u1', email: 'demo@jobtrack.dev', name: 'Demo User' } },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LoginForm />
      </MockedProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/applications'));
  });

  it('shows the error returned by the API', async () => {
    const mocks = [
      {
        request: { query: LoginDocument, variables: credentials },
        error: new Error('Invalid email or password'),
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <LoginForm />
      </MockedProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
