import { type ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { GqlContext } from '../gql-context';

/**
 * ThrottlerGuard adapted for a mixed HTTP + GraphQL application.
 *
 * The official GraphQL example assumes every request has a GraphQL context.
 * This app also exposes the HTTP `/health` endpoint, so the guard must fall
 * back to the HTTP request/response there. Without the branch, req/res are
 * undefined and ThrottlerGuard throws while setting rate-limit headers.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected override getRequestResponse(context: ExecutionContext) {
    if (context.getType() === 'http') {
      const http = context.switchToHttp();
      return { req: http.getRequest(), res: http.getResponse() };
    }

    const gqlCtx = GqlExecutionContext.create(context);
    const { req, res } = gqlCtx.getContext<GqlContext>();
    return { req, res };
  }

  /**
   * `trust proxy` makes req.ips available. The left-most entry is the client,
   * which keeps rate limiting per-user instead of per-proxy.
   */
  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    const ips = Array.isArray(req.ips) ? (req.ips as string[]) : [];
    return ips[0] ?? (req.ip as string);
  }
}
