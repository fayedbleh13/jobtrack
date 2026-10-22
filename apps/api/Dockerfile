FROM node:24-bookworm-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@12.11.2

# Provider networks (Render included) are IPv4-only, while managed Postgres hosts such as Neon
# also publish AAAA records. Prisma's migration engine resolves through libc rather than Node,
# so Node's --dns-result-order setting does not reach it. This makes getaddrinfo prefer IPv4.
RUN echo 'precedence ::ffff:0:0/96 100' >> /etc/gai.conf

WORKDIR /app

FROM base AS build

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @jobtrack/api prisma:generate
RUN pnpm --filter @jobtrack/api build

FROM base AS runtime

ENV NODE_ENV=production

# Providers such as Render have no IPv6 route, while managed Postgres hosts publish AAAA
# records too. Node returns DNS results in verbatim order since v17, so an AAAA-first answer
# fails instantly. Prefer IPv4 so the database is reachable on any host.
ENV NODE_OPTIONS=--dns-result-order=ipv4first

WORKDIR /app

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api

WORKDIR /app/apps/api

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=10 \
  CMD curl -fsS http://localhost:4000/health || exit 1

CMD ["sh", "./docker-entrypoint.sh"]
