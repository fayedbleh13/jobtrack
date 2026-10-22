FROM node:24-bookworm-slim AS base

RUN npm install -g pnpm@12.11.2

WORKDIR /app

FROM base AS build

ARG NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @jobtrack/web build

FROM base AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web ./apps/web

WORKDIR /app/apps/web

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=10 \
  CMD node -e "fetch('http://localhost:3000/login').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["./node_modules/.bin/next", "start", "-p", "3000"]
