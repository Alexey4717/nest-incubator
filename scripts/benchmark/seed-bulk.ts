import { randomUUID } from 'crypto';
import { join } from 'path';

import { DataSource } from 'typeorm';

import { loadEnvFiles } from '@/core/env-files.utility';

import { buildPostgresConnectionOptions } from '@/modules/database/postgres-options.utility';

const BENCH_LOGIN_PREFIX = 'bench_user_';
const BENCH_DEVICE_PREFIX = 'bench_device_';
const BENCH_BLOG_NAME = 'bench_blog';
const BATCH_SIZE = 2000;

export const BENCHMARK_IDS = {
  blogId: '00000000-0000-4000-8000-000000000001',
  targetUserId: '00000000-0000-4000-8000-000000000002',
  targetPostId: '00000000-0000-4000-8000-000000000003',
} as const;

function parseArgs(argv: string[]) {
  const clean = argv.includes('--clean');
  const scaleArg = argv.find((arg) => arg.startsWith('--scale='));
  const scenarioArg = argv.find((arg) => arg.startsWith('--scenario='));

  return {
    clean,
    scale: scaleArg ? Number(scaleArg.split('=')[1]) : 100_000,
    scenario: (scenarioArg?.split('=')[1] ?? 'all') as 'users' | 'posts' | 'sessions' | 'all',
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
      poolMax: 5,
      connectionTimeoutMs: 30_000,
    }),
    entities: [],
    synchronize: false,
  });

  await dataSource.initialize();
  return dataSource;
}

async function cleanBenchmarkData(dataSource: DataSource): Promise<void> {
  await dataSource.query(`DELETE FROM "comments" WHERE "post_id" = $1`, [BENCHMARK_IDS.targetPostId]);
  await dataSource.query(`DELETE FROM "post_reactions" WHERE "post_id" = $1`, [
    BENCHMARK_IDS.targetPostId,
  ]);
  await dataSource.query(`DELETE FROM "posts" WHERE "blog_id" = $1`, [BENCHMARK_IDS.blogId]);
  await dataSource.query(`DELETE FROM "sessions" WHERE "device_id" LIKE $1`, [
    `${BENCH_DEVICE_PREFIX}%`,
  ]);
  await dataSource.query(`DELETE FROM "users" WHERE "login" LIKE $1`, [`${BENCH_LOGIN_PREFIX}%`]);
  await dataSource.query(`DELETE FROM "blogs" WHERE "id" = $1`, [BENCHMARK_IDS.blogId]);
}

async function ensureBenchmarkBlog(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    `
      INSERT INTO "blogs" ("id", "name", "website_url", "description", "is_membership", "created_at")
      VALUES ($1, $2, 'https://bench.example', 'benchmark blog', false, NOW())
      ON CONFLICT ("id") DO NOTHING
    `,
    [BENCHMARK_IDS.blogId, BENCH_BLOG_NAME],
  );
}

async function ensureTargetUser(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    `
      INSERT INTO "users" (
        "id", "login", "email", "password_hash", "created_at", "is_confirmed"
      )
      VALUES ($1, $2, $3, '$2b$10$benchhashbenchhashbenchhashbench', NOW(), true)
      ON CONFLICT ("id") DO NOTHING
    `,
    [BENCHMARK_IDS.targetUserId, `${BENCH_LOGIN_PREFIX}target`, 'bench_target@example.com'],
  );
}

async function ensureTargetPost(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    `
      INSERT INTO "posts" (
        "id", "title", "short_description", "content", "blog_id", "blog_name", "created_at"
      )
      VALUES ($1, 'bench post', 'desc', 'content', $2, $3, NOW())
      ON CONFLICT ("id") DO NOTHING
    `,
    [BENCHMARK_IDS.targetPostId, BENCHMARK_IDS.blogId, BENCH_BLOG_NAME],
  );
}

async function seedUsers(dataSource: DataSource, count: number): Promise<void> {
  const now = new Date().toISOString();

  for (let offset = 0; offset < count; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, count - offset);
    const values: string[] = [];
    const params: unknown[] = [];

    for (let i = 0; i < batchCount; i += 1) {
      const index = offset + i;
      const login = `${BENCH_LOGIN_PREFIX}${String(index).padStart(8, '0')}`;
      const base = params.length;
      params.push(randomUUID(), login, `bench_${index}@example.com`, now, true);
      values.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, '$2b$10$benchhashbenchhashbenchhashbench', $${base + 4}, $${base + 5})`,
      );
    }

    await dataSource.query(
      `
        INSERT INTO "users" ("id", "login", "email", "password_hash", "created_at", "is_confirmed")
        VALUES ${values.join(', ')}
        ON CONFLICT ("login") DO NOTHING
      `,
      params,
    );
  }
}

async function seedPosts(dataSource: DataSource, count: number): Promise<void> {
  await ensureBenchmarkBlog(dataSource);
  const now = new Date().toISOString();

  for (let offset = 0; offset < count; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, count - offset);
    const values: string[] = [];
    const params: unknown[] = [];

    for (let i = 0; i < batchCount; i += 1) {
      const index = offset + i;
      const base = params.length;
      params.push(
        randomUUID(),
        `bench post ${index}`,
        'desc',
        'content',
        BENCHMARK_IDS.blogId,
        BENCH_BLOG_NAME,
        now,
      );
      values.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`,
      );
    }

    await dataSource.query(
      `
        INSERT INTO "posts" (
          "id", "title", "short_description", "content", "blog_id", "blog_name", "created_at"
        )
        VALUES ${values.join(', ')}
      `,
      params,
    );
  }
}

async function seedSessions(dataSource: DataSource, count: number): Promise<void> {
  await ensureTargetUser(dataSource);
  const now = new Date().toISOString();

  for (let offset = 0; offset < count; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, count - offset);
    const values: string[] = [];
    const params: unknown[] = [];

    for (let i = 0; i < batchCount; i += 1) {
      const index = offset + i;
      const base = params.length;
      params.push(
        `${BENCH_DEVICE_PREFIX}${String(index).padStart(8, '0')}`,
        BENCHMARK_IDS.targetUserId,
        '127.0.0.1',
        'bench device',
        now,
        randomUUID(),
      );
      values.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`,
      );
    }

    await dataSource.query(
      `
        INSERT INTO "sessions" (
          "device_id", "user_id", "ip", "title", "last_active_date", "current_refresh_token_jti"
        )
        VALUES ${values.join(', ')}
        ON CONFLICT ("device_id") DO NOTHING
      `,
      params,
    );
  }
}

export async function cleanScenarioSeed(
  dataSource: DataSource,
  scenario: 'users' | 'posts' | 'sessions',
): Promise<void> {
  if (scenario === 'users') {
    await dataSource.query(`DELETE FROM "users" WHERE "login" LIKE $1`, [`${BENCH_LOGIN_PREFIX}%`]);
    await dataSource.query(`DELETE FROM "users" WHERE "id" = $1`, [BENCHMARK_IDS.targetUserId]);
    return;
  }

  if (scenario === 'posts') {
    await dataSource.query(`DELETE FROM "comments" WHERE "post_id" = $1`, [BENCHMARK_IDS.targetPostId]);
    await dataSource.query(`DELETE FROM "post_reactions" WHERE "post_id" = $1`, [
      BENCHMARK_IDS.targetPostId,
    ]);
    await dataSource.query(`DELETE FROM "posts" WHERE "blog_id" = $1`, [BENCHMARK_IDS.blogId]);
    await dataSource.query(`DELETE FROM "blogs" WHERE "id" = $1`, [BENCHMARK_IDS.blogId]);
    return;
  }

  await dataSource.query(`DELETE FROM "sessions" WHERE "device_id" LIKE $1`, [
    `${BENCH_DEVICE_PREFIX}%`,
  ]);
  await dataSource.query(`DELETE FROM "users" WHERE "id" = $1`, [BENCHMARK_IDS.targetUserId]);
}

export async function seedBenchmarkData(
  dataSource: DataSource,
  scale: number,
  scenario: 'users' | 'posts' | 'sessions' | 'all',
): Promise<void> {
  if (scenario === 'users' || scenario === 'all') {
    await seedUsers(dataSource, scale);
  }

  if (scenario === 'posts' || scenario === 'all') {
    await seedPosts(dataSource, scale);
  }

  if (scenario === 'sessions' || scenario === 'all') {
    await seedSessions(dataSource, scale);
  }
}

async function bootstrap(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const dataSource = await createDataSource();

  try {
    if (args.clean) {
      console.log('Cleaning benchmark data…');
      await cleanBenchmarkData(dataSource);
      console.log('Benchmark data removed.');
      return;
    }

    console.log(`Seeding benchmark data: scenario=${args.scenario}, scale=${args.scale}`);
    await seedBenchmarkData(dataSource, args.scale, args.scenario);
    await ensureTargetPost(dataSource);
    console.log('Benchmark seed completed.');
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  bootstrap().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
