/**
 * `pg-connection-string` currently treats `prefer`, `require`, and `verify-ca`
 * as aliases for `verify-full`, but warns that this will change in pg v9.
 * Make the current behaviour explicit so production logs stay clean and the
 * connection keeps full certificate verification.
 */
export function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) {
    return url;
  }

  return url.replace(/([?&])sslmode=(require|prefer|verify-ca)(?=&|$)/g, '$1sslmode=verify-full');
}
