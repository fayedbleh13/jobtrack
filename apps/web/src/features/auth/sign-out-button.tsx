'use client';

import { useApolloClient, useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogoutDocument } from '@/graphql/generated/graphql';

export function SignOutButton() {
  const router = useRouter();
  const client = useApolloClient();
  const [logout, { loading }] = useMutation(LogoutDocument);

  async function handleSignOut() {
    try {
      await logout();
    } catch {
      // Clear local state even if the network call fails.
    } finally {
      await client.clearStore();
      router.replace('/login');
      router.refresh();
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut} disabled={loading}>
      Sign out
    </Button>
  );
}
