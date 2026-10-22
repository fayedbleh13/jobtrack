import { type NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'access_token';

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE));
  const { pathname } = request.nextUrl;

  if (!hasSession && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/applications', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // `/graphql` is excluded: when Next proxies the API it must reach the handler
  // untouched. The API guards its own operations, and redirecting an
  // unauthenticated `login` mutation would make signing in impossible.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|graphql).*)'],
};
