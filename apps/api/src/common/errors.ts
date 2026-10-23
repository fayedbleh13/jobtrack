import { GraphQLError } from 'graphql';

/**
 * Returns a GraphQL error with a stable machine-readable code.
 * Clients should branch on `extensions.code`, not on the message text.
 */
export function notFound(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' },
  });
}
