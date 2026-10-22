'use client';

import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogoutDocument } from '@/graphql/generated/graphql';

export function SignOutButton() {
  const router = useRouter();
  const [logout, { loading }] = useMutation(LogoutDocument);

  async function handleSignOut() {
    await logout();
    router.replace('/login');
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut} disabled={loading}>
      Sign out
    </Button>
  );
}
