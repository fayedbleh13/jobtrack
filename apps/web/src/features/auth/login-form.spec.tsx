import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginDocument } from '@/graphql/generated/graphql';
import { renderWithApollo } from '../../../test/render';
import { LoginForm } from './login-form';

const { replace, refresh } = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}));

const credentials = {
  input: { email: 'demo@jobtrack.dev', password: 'password123' },
};

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText(/email/i), credentials.input.email);
  await userEvent.type(screen.getByLabelText(/password/i), credentials.input.password);
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

describe('LoginForm', () => {
  it('signs in and redirects to the applications board', async () => {
    renderWithApollo(<LoginForm />, [
      {
        request: { query: LoginDocument, variables: credentials },
        result: {
          data: {
            login: { user: { id: 'u1', email: 'demo@jobtrack.dev', name: 'Demo User' } },
          },
        },
      },
    ]);

    await fillAndSubmit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/applications'));
  });

  it('shows the error returned by the API', async () => {
    renderWithApollo(<LoginForm />, [
      {
        request: { query: LoginDocument, variables: credentials },
        error: new Error('Invalid email or password'),
      },
    ]);

    await fillAndSubmit();

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
