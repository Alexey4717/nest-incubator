import { readFileSync } from 'fs';
import { join } from 'path';

import { DataSource } from 'typeorm';

import { loadEnvFiles } from '@/core/env-files.utility';

import { buildPostgresConnectionOptions } from '@/modules/database/postgres-options.utility';

import { BENCHMARK_IDS } from './seed-bulk';
import { parseExplainJson } from './parse-explain';

const EXPLAIN_DIR = join(__dirname, '../sql/explain');

const DEFAULT_PARAMS: Record<string, string> = {
  target_login: `${'bench_user_'}${String(50_000).padStart(8, '0')}`,
  target_login_or_email: `${'bench_user_'}${String(50_000).padStart(8, '0')}`,
  blog_id: BENCHMARK_IDS.blogId,
  post_id: BENCHMARK_IDS.targetPostId,
  user_id: BENCHMARK_IDS.targetUserId,
  blog_name: 'bench_blog',
  expired_before: new Date().toISOString(),
};

function renderSql(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (sql, [key, value]) => sql.replaceAll(`{{${key}}}`, value),
    template,
  );
}

function parseArgs(argv: string[]) {
  const fileArg = argv.find((arg) => !arg.startsWith('--'));
  const noIndex = argv.includes('--no-index');

  return {
    file: fileArg ?? '01-users-login.sql',
    noIndex,
  };
}

async function createDataSource(): Promise<DataSource> {
  const nodeEnv = process.env.NODE_ENV || 'development';
  loadEnvFiles(join(__dirname, '../../src/env'), nodeEnv);

  const dataSource = new DataSource({
    ...buildPostgresConnectionOptions({
      host: process.env.POSTGRES_HOST ?? '',
      port: Number(process.env.POSTGRES_PORT || 5432),
      username: process.env.POSTGRES_USER ?? '',
      password: process.env.POSTGRES_PASSWORD ?? '',
      database: process.env.DB_NAME ?? '',
      ssl: process.env.POSTGRES_SSL,
    }),
    entities: [],
    synchronize: false,
  });

  await dataSource.initialize();
  return dataSource;
}

async function bootstrap(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const sqlPath = join(EXPLAIN_DIR, args.file);
  const template = readFileSync(sqlPath, 'utf8');
  const query = renderSql(template, DEFAULT_PARAMS);
  const dataSource = await createDataSource();

  try {
    if (args.noIndex) {
      await dataSource.query(`SET enable_indexscan = off`);
      await dataSource.query(`SET enable_bitmapscan = off`);
    }

    const raw = await dataSource.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`);
    const metrics = parseExplainJson(raw);

    console.log(JSON.stringify(metrics, null, 2));
  } finally {
    await dataSource.destroy();
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
