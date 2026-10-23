import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { lexicographicSortSchema, printSchema } from 'graphql';
import { AnalyticsResolver } from '../src/analytics/analytics.resolver';
import { ApplicationsResolver } from '../src/applications/applications.resolver';
import { AuthResolver } from '../src/auth/auth.resolver';
import { HealthResolver } from '../src/health/health.resolver';
import { RemindersResolver } from '../src/reminders/reminders.resolver';

async function main(): Promise<void> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule, { logger: false });
  await app.init();

  const factory = app.get(GraphQLSchemaFactory);
  const schema = await factory.create([
    ApplicationsResolver,
    AuthResolver,
    AnalyticsResolver,
    RemindersResolver,
    HealthResolver,
  ]);

  const header = [
    '# ------------------------------------------------------',
    '# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)',
    '# ------------------------------------------------------',
    '',
    '',
  ].join('\n');
  const output = `${header}${printSchema(lexicographicSortSchema(schema))}`;
  writeFileSync(join(process.cwd(), 'src/schema.gql'), output, 'utf8');
  await app.close();
}

void main();
