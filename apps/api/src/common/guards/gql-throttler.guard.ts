import { type ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { GqlContext } from '../gql-context';

/**
 * ThrottlerGuard adapted for the GraphQL execution context.
 * The default guard reads `request` from the HTTP context which doesn't
 * exist for GQL operations — this override extracts the underlying Express
 * request from the Apollo GQL context instead.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected override getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const { req, res } = gqlCtx.getContext<GqlContext>();
    return { req, res };
  }
}
