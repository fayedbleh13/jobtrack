'use client';

import { ApolloProvider } from '@apollo/client/react';
import { type ReactNode, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { createApolloClient } from '@/lib/apollo-client';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(createApolloClient);

  return (
    <ApolloProvider client={client}>
      {children}
      <Toaster position="top-right" closeButton />
    </ApolloProvider>
  );
}
