import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { GqlThrottlerGuard } from './gql-throttler.guard';

function makeGuard(): GqlThrottlerGuard {
  return Object.create(GqlThrottlerGuard.prototype) as GqlThrottlerGuard;
}

function getRequestResponse(context: ExecutionContext) {
  return (
    makeGuard() as unknown as {
      getRequestResponse: (context: ExecutionContext) => { req: unknown; res: unknown };
    }
  ).getRequestResponse(context);
}

function getTracker(req: Record<string, unknown>) {
  return (
    makeGuard() as unknown as {
      getTracker: (req: Record<string, unknown>) => Promise<string>;
    }
  ).getTracker(req);
}

describe('GqlThrottlerGuard', () => {
  it('reads the request and response from an HTTP execution context', () => {
    const req = { ip: '127.0.0.1', headers: {} };
    const res = { setHeader: () => undefined };
    const context = {
      getType: () => 'http',
      getArgs: () => [req, res, () => undefined],
      getClass: () => class HealthController {},
      getHandler: () => () => undefined,
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    } as unknown as ExecutionContext;

    expect(getRequestResponse(context)).toEqual({ req, res });
  });

  it('reads the request and response from a GraphQL execution context', () => {
    const req = { ip: '127.0.0.1', headers: {} };
    const res = { setHeader: () => undefined };
    const context = {
      getType: () => 'graphql',
      getArgs: () => [{}, {}, { req, res }, {}],
      getClass: () => class ApplicationsResolver {},
      getHandler: () => () => undefined,
    } as unknown as ExecutionContext;

    expect(getRequestResponse(context)).toEqual({ req, res });
  });

  it('uses the left-most forwarded IP when behind a proxy', async () => {
    await expect(getTracker({ ip: '10.0.0.1', ips: ['203.0.113.7', '10.0.0.1'] })).resolves.toBe(
      '203.0.113.7',
    );
  });

  it('falls back to req.ip when there is no forwarded chain', async () => {
    await expect(getTracker({ ip: '203.0.113.7', ips: [] })).resolves.toBe('203.0.113.7');
  });
});
