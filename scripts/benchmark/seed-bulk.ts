import { randomUUID } from 'crypto';
import { join } from 'path';

import { uuidv7 } from 'uuidv7';
import { DataSource } from 'typeorm';

import { loadEnvFiles } from '@/core/env-files.utility';

import { buildPostgresConnectionOptions } from '@/modules/database/postgres-options.utility';

const BENCH_LOGIN_PREFIX = 'bench_user_';
const BENCH_DEVICE_PREFIX = 'bench_device_';
const BENCH_BLOG_NAME = 'bench_blog';
const BENCH_BLOG_FILLER_PREFIX = 'bench_blog_filler_';
const BENCH_NOISE_USER_PREFIX = 'bench_noise_user_';
const BENCH_NOISE_DEVICE_PREFIX = 'bench_noise_device_';
const FILLER_BLOG_COUNT = 9;
const FILLER_USER_COUNT = 9;
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
  await dataSource.query(
    `DELETE FROM "comments" WHERE "post_id" IN (SELECT "id" FROM "posts" WHERE "public_id" = $1)`,
    [BENCHMARK_IDS.targetPostId],
  );
  await dataSource.query(
    `DELETE FROM "post_reactions" WHERE "post_id" IN (SELECT "id" FROM "posts" WHERE "public_id" = $1)`,
    [BENCHMARK_IDS.targetPostId],
  );
  await dataSource.query(
    `DELETE FROM "posts" WHERE "blog_id" IN (
      SELECT "id" FROM "blogs" WHERE "public_id" = $1 OR "name" LIKE $2
    )`,
    [BENCHMARK_IDS.blogId, `${BENCH_BLOG_FILLER_PREFIX}%`],
  );
  await dataSource.query(
    `DELETE FROM "sessions" WHERE "device_id" LIKE $1 OR "device_id" LIKE $2`,
    [`${BENCH_DEVICE_PREFIX}%`, `${BENCH_NOISE_DEVICE_PREFIX}%`],
  );
  await dataSource.query(
    `DELETE FROM "users" WHERE "login" LIKE $1 OR "login" LIKE $2 OR "public_id" = $3`,
    [`${BENCH_LOGIN_PREFIX}%`, `${BENCH_NOISE_USER_PREFIX}%`, BENCHMARK_IDS.targetUserId],
  );
  await dataSource.query(
    `DELETE FROM "blogs" WHERE "public_id" = $1 OR "name" LIKE $2`,
    [BENCHMARK_IDS.blogId, `${BENCH_BLOG_FILLER_PREFIX}%`],
  );
}

async function ensureBenchmarkBlog(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    `
      INSERT INTO "blogs" ("public_id", "name", "website_url", "description", "is_membership", "created_at")
      VALUES ($1, $2, 'https://bench.example', 'benchmark blog', false, NOW())
      ON CONFLICT ("public_id") DO NOTHING
    `,
    [BENCHMARK_IDS.blogId, BENCH_BLOG_NAME],
  );
}

async function ensureTargetUser(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    `
      INSERT INTO "users" (
        "public_id", "login", "email", "password_hash", "created_at", "is_confirmed"
      )
      VALUES ($1, $2, $3, '$2b$10$benchhashbenchhashbenchhashbench', NOW(), true)
      ON CONFLICT ("login") DO NOTHING
    `,
    [BENCHMARK_IDS.targetUserId, `${BENCH_LOGIN_PREFIX}target`, 'bench_target@example.com'],
  );
}

async function ensureTargetPost(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    `
      INSERT INTO "posts" (
        "public_id", "title", "short_description", "content", "blog_id", "blog_name", "created_at"
      )
      SELECT $1, 'bench post', 'desc', 'content', b."id", $2, NOW()
      FROM "blogs" b
      WHERE b."public_id" = $3
      ON CONFLICT ("public_id") DO NOTHING
    `,
    [BENCHMARK_IDS.targetPostId, BENCH_BLOG_NAME, BENCHMARK_IDS.blogId],
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
      params.push(uuidv7(), login, `bench_${index}@example.com`, now, true);
      values.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, '$2b$10$benchhashbenchhashbenchhashbench', $${base + 4}, $${base + 5})`,
      );
    }

    await dataSource.query(
      `
        INSERT INTO "users" ("public_id", "login", "email", "password_hash", "created_at", "is_confirmed")
        VALUES ${values.join(', ')}
        ON CONFLICT ("login") DO NOTHING
      `,
      params,
    );
  }
}

async function ensureFillerBlog(dataSource: DataSource, index: number): Promise<string> {
  const publicId = `00000000-0000-4000-8000-${String(index + 10).padStart(12, '0')}`;
  const name = `${BENCH_BLOG_FILLER_PREFIX}${index}`;

  await dataSource.query(
    `
      INSERT INTO "blogs" ("public_id", "name", "website_url", "description", "is_membership", "created_at")
      VALUES ($1, $2, 'https://bench.example', 'filler blog', false, NOW())
      ON CONFLICT ("public_id") DO NOTHING
    `,
    [publicId, name],
  );

  return publicId;
}

async function seedPostsForBlog(
  dataSource: DataSource,
  count: number,
  blogPublicId: string,
  blogName: string,
  titlePrefix: string,
): Promise<void> {
  const now = new Date().toISOString();

  for (let offset = 0; offset < count; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, count - offset);
    const values: string[] = [];
    const params: unknown[] = [];

    for (let i = 0; i < batchCount; i += 1) {
      const index = offset + i;
      const base = params.length;
      params.push(uuidv7(), `${titlePrefix} ${index}`, 'desc', 'content', blogName, now, blogPublicId);
      values.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, (SELECT "id" FROM "blogs" WHERE "public_id" = $${base + 7}), $${base + 5}, $${base + 6})`,
      );
    }

    await dataSource.query(
      `
        INSERT INTO "posts" (
          "public_id", "title", "short_description", "content", "blog_id", "blog_name", "created_at"
        )
        VALUES ${values.join(', ')}
      `,
      params,
    );
  }
}

async function seedPosts(dataSource: DataSource, count: number): Promise<void> {
  await ensureBenchmarkBlog(dataSource);

  for (let fillerIndex = 0; fillerIndex < FILLER_BLOG_COUNT; fillerIndex += 1) {
    const fillerBlogPublicId = await ensureFillerBlog(dataSource, fillerIndex);
    await seedPostsForBlog(
      dataSource,
      count,
      fillerBlogPublicId,
      `${BENCH_BLOG_FILLER_PREFIX}${fillerIndex}`,
      'filler post',
    );
  }

  await seedPostsForBlog(dataSource, count, BENCHMARK_IDS.blogId, BENCH_BLOG_NAME, 'bench post');
}

async function seedNoiseUsersWithSessions(dataSource: DataSource, count: number): Promise<void> {
  const now = new Date().toISOString();

  for (let offset = 0; offset < count; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, count - offset);
    const userValues: string[] = [];
    const userParams: unknown[] = [];

    for (let i = 0; i < batchCount; i += 1) {
      const index = offset + i;
      const base = userParams.length;
      userParams.push(
        uuidv7(),
        `${BENCH_NOISE_USER_PREFIX}${String(index).padStart(8, '0')}`,
        `bench_noise_${index}@example.com`,
        now,
        true,
      );
      userValues.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, '$2b$10$benchhashbenchhashbenchhashbench', $${base + 4}, $${base + 5})`,
      );
    }

    await dataSource.query(
      `
        INSERT INTO "users" ("public_id", "login", "email", "password_hash", "created_at", "is_confirmed")
        VALUES ${userValues.join(', ')}
        ON CONFLICT ("login") DO NOTHING
      `,
      userParams,
    );

    const sessionValues: string[] = [];
    const sessionParams: unknown[] = [];

    for (let i = 0; i < batchCount; i += 1) {
      const index = offset + i;
      const login = `${BENCH_NOISE_USER_PREFIX}${String(index).padStart(8, '0')}`;
      const base = sessionParams.length;
      sessionParams.push(
        `${BENCH_NOISE_DEVICE_PREFIX}${String(index).padStart(8, '0')}`,
        login,
        '127.0.0.1',
        'noise device',
        now,
        randomUUID(),
      );
      sessionValues.push(
        `($${base + 1}, (SELECT "id" FROM "users" WHERE "login" = $${base + 2}), $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`,
      );
    }

    await dataSource.query(
      `
        INSERT INTO "sessions" (
          "device_id", "user_id", "ip", "title", "last_active_date", "current_refresh_token_jti"
        )
        VALUES ${sessionValues.join(', ')}
        ON CONFLICT ("device_id") DO NOTHING
      `,
      sessionParams,
    );
  }
}

async function seedSessions(dataSource: DataSource, count: number): Promise<void> {
  await ensureTargetUser(dataSource);
  await seedNoiseUsersWithSessions(dataSource, count * FILLER_USER_COUNT);
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
        `($${base + 1}, (SELECT "id" FROM "users" WHERE "public_id" = $${base + 2}), $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`,
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
    await dataSource.query(`DELETE FROM "users" WHERE "public_id" = $1`, [BENCHMARK_IDS.targetUserId]);
    return;
  }

  if (scenario === 'posts') {
    await dataSource.query(
      `DELETE FROM "comments" WHERE "post_id" IN (SELECT "id" FROM "posts" WHERE "public_id" = $1)`,
      [BENCHMARK_IDS.targetPostId],
    );
    await dataSource.query(
      `DELETE FROM "post_reactions" WHERE "post_id" IN (SELECT "id" FROM "posts" WHERE "public_id" = $1)`,
      [BENCHMARK_IDS.targetPostId],
    );
    await dataSource.query(
      `DELETE FROM "posts" WHERE "blog_id" IN (
        SELECT "id" FROM "blogs" WHERE "public_id" = $1 OR "name" LIKE $2
      )`,
      [BENCHMARK_IDS.blogId, `${BENCH_BLOG_FILLER_PREFIX}%`],
    );
    await dataSource.query(
      `DELETE FROM "blogs" WHERE "public_id" = $1 OR "name" LIKE $2`,
      [BENCHMARK_IDS.blogId, `${BENCH_BLOG_FILLER_PREFIX}%`],
    );
    return;
  }

  await dataSource.query(
    `DELETE FROM "sessions" WHERE "device_id" LIKE $1 OR "device_id" LIKE $2`,
    [`${BENCH_DEVICE_PREFIX}%`, `${BENCH_NOISE_DEVICE_PREFIX}%`],
  );
  await dataSource.query(
    `DELETE FROM "users" WHERE "public_id" = $1 OR "login" LIKE $2`,
    [BENCHMARK_IDS.targetUserId, `${BENCH_NOISE_USER_PREFIX}%`],
  );
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
