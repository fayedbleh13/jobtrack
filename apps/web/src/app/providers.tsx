'use client';

import { ApolloProvider } from '@apollo/client/react';
import { type ReactNode, useState } from 'react';
import { createApolloClient } from '@/lib/apollo-client';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(createApolloClient);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
