import { ApolloClient, CombinedGraphQLErrors, from, InMemoryCache } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { HttpLink } from '@apollo/client/link/http';
import { LogoutDocument } from '@/graphql/generated/graphql';

let redirectingToLogin = false;

export function createApolloClient(): ApolloClient {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/graphql',
    credentials: 'include',
  });

  let client: ApolloClient;

  // Expired/invalid sessions currently surface as UNAUTHENTICATED on every
  // query. Clear the stale cookie and cache once, then send the user to login.
  const errorLink = new ErrorLink(({ error }) => {
    if (!CombinedGraphQLErrors.is(error)) {
      return;
    }

    const unauthenticated = error.errors.some(
      (entry) => entry.extensions?.code === 'UNAUTHENTICATED',
    );

    if (
      !unauthenticated ||
      typeof window === 'undefined' ||
      window.location.pathname === '/login' ||
      redirectingToLogin
    ) {
      return;
    }

    redirectingToLogin = true;
    void (async () => {
      try {
        await client.mutate({ mutation: LogoutDocument });
      } catch {
        // The cookie may already be gone; clearing local state is still useful.
      }
      await client.clearStore().catch(() => undefined);
      window.location.assign('/login');
    })();
  });

  client = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
  });

  return client;
}
