import { randomUUID } from 'crypto';
import { join } from 'path';

import { uuidv7 } from 'uuidv7';
import { DataSource } from 'typeorm';

import { loadEnvFiles } from '@/core/env-files.utility';

import { buildPostgresConnectionOptions } from '@/modules/database/postgres-options.utility';

import {
  InsertPkAssertionResult,
  InsertPkBenchmarkReport,
  InsertPkScaleMeasurement,
  InsertPkScalingRatio,
  InsertPkStrategy,
  InsertPkStrategyReport,
} from './insert-pk.types';

const BATCH_SIZE = 2000;
const PAYLOAD = 'x'.repeat(1024);
const DEFAULT_SCALES = [50_000, 100_000, 200_000];
const QUICK_SCALES = [10_000, 20_000, 40_000];

const TABLE_BY_STRATEGY: Record<InsertPkStrategy, string> = {
  'uuidv4-pk': '_bench_insert_uuidv4',
  'uuidv7-pk': '_bench_insert_uuidv7',
  'bigint-v7-public': '_bench_insert_bigint_v7',
};

function parseArgs(argv: string[]) {
  const quick = argv.includes('--quick');
  return {
    quick,
    scales: quick ? QUICK_SCALES : DEFAULT_SCALES,
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
      connectionTimeoutMs: 120_000,
    }),
    entities: [],
    synchronize: false,
  });

  await dataSource.initialize();
  return dataSource;
}

async function recreateTable(dataSource: DataSource, strategy: InsertPkStrategy): Promise<void> {
  const table = TABLE_BY_STRATEGY[strategy];
  await dataSource.query(`DROP TABLE IF EXISTS "${table}"`);

  if (strategy === 'uuidv4-pk') {
    await dataSource.query(`
      CREATE TABLE "${table}" (
        "id" uuid PRIMARY KEY,
        "created_at" timestamptz NOT NULL,
        "payload" text NOT NULL
      )
    `);
    return;
  }

  if (strategy === 'uuidv7-pk') {
    await dataSource.query(`
      CREATE TABLE "${table}" (
        "id" uuid PRIMARY KEY,
        "created_at" timestamptz NOT NULL,
        "payload" text NOT NULL
      )
    `);
    return;
  }

  await dataSource.query(`
    CREATE TABLE "${table}" (
      "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      "public_id" uuid NOT NULL UNIQUE,
      "created_at" timestamptz NOT NULL,
      "payload" text NOT NULL
    )
  `);
}

function generateId(strategy: InsertPkStrategy): string {
  if (strategy === 'uuidv4-pk') return randomUUID();
  return uuidv7();
}

async function bulkInsert(
  dataSource: DataSource,
  strategy: InsertPkStrategy,
  count: number,
): Promise<number> {
  const table = TABLE_BY_STRATEGY[strategy];
  const startedAt = performance.now();

  for (let offset = 0; offset < count; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, count - offset);
    const values: string[] = [];
    const params: unknown[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < batchCount; i += 1) {
      const base = params.length;
      const id = generateId(strategy);

      if (strategy === 'bigint-v7-public') {
        params.push(id, now, PAYLOAD);
        values.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
      } else {
        params.push(id, now, PAYLOAD);
        values.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
      }
    }

    if (strategy === 'bigint-v7-public') {
      await dataSource.query(
        `INSERT INTO "${table}" ("public_id", "created_at", "payload") VALUES ${values.join(', ')}`,
        params,
      );
    } else {
      await dataSource.query(
        `INSERT INTO "${table}" ("id", "created_at", "payload") VALUES ${values.join(', ')}`,
        params,
      );
    }
  }

  return performance.now() - startedAt;
}

async function measureIndexSizes(
  dataSource: DataSource,
  strategy: InsertPkStrategy,
): Promise<{ pkIndexMb: number; uqIndexMb: number | null }> {
  const table = TABLE_BY_STRATEGY[strategy];

  const pkRows: { bytes: string }[] = await dataSource.query(
    `
      SELECT pg_relation_size(c.oid) AS bytes
      FROM pg_class c
      JOIN pg_index i ON c.oid = i.indexrelid
      JOIN pg_class t ON i.indrelid = t.oid
      WHERE t.relname = $1 AND i.indisprimary
      LIMIT 1
    `,
    [table],
  );

  let uqIndexMb: number | null = null;
  if (strategy === 'bigint-v7-public') {
    const uqRows: { bytes: string }[] = await dataSource.query(
      `
        SELECT pg_relation_size(c.oid) AS bytes
        FROM pg_class c
        JOIN pg_index i ON c.oid = i.indexrelid
        JOIN pg_class t ON i.indrelid = t.oid
        WHERE t.relname = $1 AND i.indisunique AND NOT i.indisprimary
        LIMIT 1
      `,
      [table],
    );
    uqIndexMb = Number(uqRows[0]?.bytes ?? 0) / (1024 * 1024);
  }

  return {
    pkIndexMb: Number(pkRows[0]?.bytes ?? 0) / (1024 * 1024),
    uqIndexMb,
  };
}

function computeScalingRatios(measurements: InsertPkScaleMeasurement[]): InsertPkScalingRatio[] {
  const ratios: InsertPkScalingRatio[] = [];
  for (let i = 1; i < measurements.length; i += 1) {
    const prev = measurements[i - 1];
    const curr = measurements[i];
    ratios.push({
      fromScale: prev.scale,
      toScale: curr.scale,
      ratio: curr.insertMs / Math.max(prev.insertMs, 0.001),
    });
  }
  return ratios;
}

function buildAssertions(report: InsertPkBenchmarkReport): InsertPkAssertionResult[] {
  const byStrategy = Object.fromEntries(
    report.strategies.map((item) => [item.strategy, item]),
  ) as Record<InsertPkStrategy, InsertPkStrategyReport>;

  const v4 = byStrategy['uuidv4-pk'];
  const v7 = byStrategy['uuidv7-pk'];
  const bigintV7 = byStrategy['bigint-v7-public'];

  const maxScale = report.scales[report.scales.length - 1];
  const v4Max = v4.measurements.find((item) => item.scale === maxScale)!;
  const v7Max = v7.measurements.find((item) => item.scale === maxScale)!;
  const bigintMax = bigintV7.measurements.find((item) => item.scale === maxScale)!;

  const assertions: InsertPkAssertionResult[] = [];

  assertions.push({
    name: 'uuidv7-faster-than-v4',
    passed: v7Max.insertMs <= v4Max.insertMs,
    message: `Expected T(uuidv7) <= T(uuidv4), got ${v7Max.insertMs.toFixed(0)}ms vs ${v4Max.insertMs.toFixed(0)}ms`,
  });

  assertions.push({
    name: 'bigint-v7-not-slower-than-v7',
    passed: bigintMax.insertMs <= 1.2 * v7Max.insertMs,
    message: `Expected T(bigint+v7) <= 1.2 * T(uuidv7), got ${bigintMax.insertMs.toFixed(0)}ms vs ${v7Max.insertMs.toFixed(0)}ms`,
  });

  const v4Superlinear = v4.scalingRatios.some((ratio) => ratio.ratio >= 1.2);
  assertions.push({
    name: 'v4-superlinear-scaling',
    passed: v4Superlinear,
    message: v4Superlinear
      ? 'uuidv4 T(2N)/T(N) >= 1.2 on at least one scale pair'
      : `Expected uuidv4 superlinear scaling, max ratio ${Math.max(...v4.scalingRatios.map((r) => r.ratio)).toFixed(2)}`,
  });

  return assertions;
}

function printReport(report: InsertPkBenchmarkReport): void {
  console.log('\n=== INSERT PK Benchmark (lecture 09) ===\n');

  for (const strategyReport of report.strategies) {
    console.log(`Strategy: ${strategyReport.strategy}`);
    console.log('| Scale | Insert (ms) | T(2N)/T(N) | PK index (MB) | UQ index (MB) |');
    console.log('|------:|--------------:|-----------:|--------------:|--------------:|');

    for (let i = 0; i < strategyReport.measurements.length; i += 1) {
      const row = strategyReport.measurements[i];
      const ratio = strategyReport.scalingRatios[i - 1]?.ratio;
      console.log(
        `| ${row.scale.toLocaleString()} | ${row.insertMs.toFixed(0)} | ${ratio ? ratio.toFixed(2) : '—'} | ${row.pkIndexMb.toFixed(1)} | ${row.uqIndexMb !== null ? row.uqIndexMb.toFixed(1) : '—'} |`,
      );
    }

    console.log('');
  }

  const v4Max = report.strategies
    .find((item) => item.strategy === 'uuidv4-pk')!
    .measurements.at(-1)!;
  const v7Max = report.strategies
    .find((item) => item.strategy === 'uuidv7-pk')!
    .measurements.at(-1)!;
  const bigintMax = report.strategies
    .find((item) => item.strategy === 'bigint-v7-public')!
    .measurements.at(-1)!;

  console.log(`Speedup uuidv4 → uuidv7 at max scale: ${(v4Max.insertMs / v7Max.insertMs).toFixed(2)}x`);
  console.log(
    `Speedup uuidv4 → bigint+v7 at max scale: ${(v4Max.insertMs / bigintMax.insertMs).toFixed(2)}x`,
  );

  console.log('\nAssertions:');
  for (const assertion of report.assertions) {
    console.log(`  ${assertion.passed ? '✓' : '✗'} ${assertion.name}: ${assertion.message}`);
  }

  console.log(report.allPassed ? '\nAll assertions passed.' : '\nSome assertions FAILED.');
}

async function runStrategy(
  dataSource: DataSource,
  strategy: InsertPkStrategy,
  scales: number[],
): Promise<InsertPkStrategyReport> {
  const measurements: InsertPkScaleMeasurement[] = [];

  for (const scale of scales) {
    console.log(`  [${strategy}] scale ${scale.toLocaleString()}…`);
    await recreateTable(dataSource, strategy);
    const insertMs = await bulkInsert(dataSource, strategy, scale);
    await dataSource.query('ANALYZE');
    const sizes = await measureIndexSizes(dataSource, strategy);
    measurements.push({ scale, insertMs, ...sizes });
  }

  return {
    strategy,
    measurements,
    scalingRatios: computeScalingRatios(measurements),
  };
}

async function bootstrap(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const dataSource = await createDataSource();

  try {
    console.log(`Running INSERT PK benchmark (scales: ${args.scales.join(', ')})…`);

    const strategies: InsertPkStrategy[] = ['uuidv4-pk', 'uuidv7-pk', 'bigint-v7-public'];
    const strategyReports: InsertPkStrategyReport[] = [];

    for (const strategy of strategies) {
      console.log(`\nStrategy: ${strategy}`);
      strategyReports.push(await runStrategy(dataSource, strategy, args.scales));
    }

    const partialReport: InsertPkBenchmarkReport = {
      scales: args.scales,
      strategies: strategyReports,
      assertions: [],
      allPassed: false,
    };
    partialReport.assertions = buildAssertions(partialReport);
    partialReport.allPassed = partialReport.assertions.every((item) => item.passed);

    printReport(partialReport);
    process.exit(partialReport.allPassed ? 0 : 1);
  } finally {
    for (const table of Object.values(TABLE_BY_STRATEGY)) {
      await dataSource.query(`DROP TABLE IF EXISTS "${table}"`);
    }
    await dataSource.destroy();
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
