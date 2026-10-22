#!/bin/sh
set -e

echo "Checking database connectivity..."
node ./scripts/db-preflight.mjs

echo "Applying database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Seeding demo data if the database is empty..."
./node_modules/.bin/tsx prisma/seed.ts

echo "Starting the API..."
exec node dist/main.js
